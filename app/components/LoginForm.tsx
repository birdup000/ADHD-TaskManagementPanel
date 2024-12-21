import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../providers/AuthProvider';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  const { loginUser, continueWithoutAuth } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await loginUser(username, password);
      if (response.success) {
        router.push('/');
      }
    } catch (error: any) {
      console.error('Login failed', error);
    }
  };

  const handleSkipAuth = async () => {
    const result = await continueWithoutAuth();
    if (result.success) {
      router.push('/');
    }
  };

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
            />
          </div>
          <div className="space-y-2">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Login</Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-gray-700 hover:bg-gray-800"
              onClick={handleSkipAuth}
            >
              Continue without Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
