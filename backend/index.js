const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const OpenAI = require('openai');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const MEALS_TABLE = 'Meals';

// OpenAI client setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// DynamoDB client setup
const dynamo = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

app.use(cors());
app.use(express.json());

// ✅ Generate Meal Plan
app.post('/generate-meal', async (req, res) => {
  const { ingredients, calorieGoal, mealType, dietaryPreference } = req.body;

  const prompt = `Generate a ${mealType || ''} meal plan with approx ${calorieGoal || 600} calories, using these ingredients: ${ingredients}. It should be ${dietaryPreference || 'standard'} diet.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful meal planner.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
    });

    const meal = response.choices[0].message.content.trim();
    res.status(200).json({ meal });
  } catch (error) {
    console.error('❌ Error generating meal:', error);
    res.status(500).json({ error: 'Failed to generate meal' });
  }
});

// ✅ Store Meal
app.post('/store-meal', async (req, res) => {
  const { email, ingredients, calorieGoal, mealType, dietaryPreference, meal } = req.body;
  const requestId = `${Date.now()}`;

  const params = {
    TableName: MEALS_TABLE,
    Item: {
      userEmail: email,
      requestId,
      ingredients,
      calorieGoal,
      mealType,
      dietaryPreference,
      meal,
      isFavorite: false,
    },
  };

  try {
    await dynamo.put(params).promise();
    console.log(`✅ Meal plan stored in DynamoDB (Meals table)`);
    res.status(200).json({ message: 'Meal stored successfully' });
  } catch (error) {
    console.error('❌ Error storing meal:', error);
    res.status(500).json({ error: 'Failed to store meal' });
  }
});

// ✅ Get Meals
app.get('/get-meals', async (req, res) => {
  const { email } = req.query;

  const params = {
    TableName: MEALS_TABLE,
    KeyConditionExpression: 'userEmail = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  try {
    const result = await dynamo.query(params).promise();
    res.status(200).json({ meals: result.Items });
  } catch (error) {
    console.error('❌ Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// ✅ Mark as Favorite
app.post('/favorite-meal', async (req, res) => {
  const { email, requestId, isFavorite } = req.body;

  const params = {
    TableName: MEALS_TABLE,
    Key: {
      userEmail: email,
      requestId: requestId,
    },
    UpdateExpression: 'SET isFavorite = :fav',
    ExpressionAttributeValues: {
      ':fav': isFavorite,
    },
  };

  try {
    await dynamo.update(params).promise();
    console.log(`✅ Meal ${requestId} favorite status updated to ${isFavorite}`);
    res.status(200).json({ message: 'Meal favorite updated' });
  } catch (error) {
    console.error('❌ Error updating favorite:', error);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// ✅ Delete Meal
app.delete('/delete-meal', async (req, res) => {
  const { email, requestId } = req.body;

  const params = {
    TableName: MEALS_TABLE,
    Key: {
      userEmail: email,
      requestId: requestId,
    },
  };

  try {
    await dynamo.delete(params).promise();
    console.log(`✅ Meal ${requestId} deleted`);
    res.status(200).json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting meal:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// ✅ Server Start
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
