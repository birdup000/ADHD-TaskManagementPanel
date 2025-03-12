import { useState, useEffect } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { Category } from '../types/category';

const STORAGE_KEY = 'categories';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { getItem, setItem } = useAsyncStorage();

  // Load categories from storage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedCategories = await getItem(STORAGE_KEY);
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Save categories to storage
  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      await setItem(STORAGE_KEY, JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  };

  // Add a new category
  const addCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCategory: Category = {
      ...category,
      id: `category-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const updatedCategories = [...categories, newCategory];
    await saveCategories(updatedCategories);
    return newCategory;
  };

  // Update an existing category
  const updateCategory = async (categoryId: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      return category;
    });
    await saveCategories(updatedCategories);
  };

  // Delete a category
  const deleteCategory = async (categoryId: string) => {
    const updatedCategories = categories.filter(category => category.id !== categoryId);
    await saveCategories(updatedCategories);
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};