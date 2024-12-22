import React, { useState } from 'react';
import { useAuthContext } from '../providers/AuthProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import LoadingScreen from './LoadingScreen';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const { loginUser, continueWithoutAuth } = useAuthContext();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await loginUser(username, password);
      if (result.success) {
        setShowLoadingScreen(true);
      }
    } catch (error: any) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAuth = async () => {
    setIsLoading(true);
    try {
      const result = await continueWithoutAuth();
      console.log('Continue without auth result:', result);
      if (result.success) {
        setShowLoadingScreen(true);
        // Keep loading screen visible during transition
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error in handleSkipAuth:', error);
      setIsLoading(false);
    }
  };

  if (showLoadingScreen) {
    return <LoadingScreen />;
  }

  return (
    <Card className="w-[350px] border border-gray-700">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your username and password to login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-gray-700 hover:bg-gray-800"
              onClick={handleSkipAuth}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Continue without Login'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
