import express from "express";
import mongoose from "mongoose";
import { RecipesModel } from "../models/Recipes.js";
import { UserModel } from "../models/Users.js";
import { verifyToken } from "./users.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await RecipesModel.find({});
    res.json(response);
  } catch (err) {
    res.json(err);
  }
});

router.post("/", verifyToken, async (req, res) => {
    const recipe = new RecipesModel(req.body);
    try {
      const response = await recipe.save();
      res.json(response);
    } catch (err) {
      res.json(err);
    }
  });
//
router.put("/", verifyToken, async (req, res) => {
  try {
    const recipe = await RecipesModel.findById(req.body.recipeID);
    const user = await UserModel.findById(req.body.userID);
    user.savedRecipes.push(recipe);
    await user.save();
    res.json({savedRecipes:user.savedRecipes});
  } catch (err) {
    res.json(err);
  }
});

router.put("/delete", async (req, res) => {
  try {
    const recipeIdToRemove = req.body.recipeID;
    const userId = req.body.userID;

    const user = await UserModel.findById(userId);
    const index = user.savedRecipes.indexOf(recipeIdToRemove);
    
    if (index !== -1) {
      user.savedRecipes.splice(index, 1); // Remove the recipe ID from the array
      await user.save();
      res.json({ savedRecipes: user.savedRecipes });
    } else {
      res.status(404).json({ message: "Recipe not found in saved recipes" });
    }
  } catch (err) {
    res.json(err);
  }
});
//
router.get("/savedRecipes/ids/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    res.status(201).json({ savedRecipes: user?.savedRecipes });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/savedRecipes/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    const savedRecipes = await RecipesModel.find({
      _id: { $in: user.savedRecipes },
    });

    console.log(savedRecipes);
    res.status(201).json({ savedRecipes });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});



export { router as recipesRouter };