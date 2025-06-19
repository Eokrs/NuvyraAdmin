
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth(); // Get user and loading state from context

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login bem-sucedido!",
        description: "Redirecionando para o painel...",
      });
      // AuthContext will handle redirect via its useEffect
    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      let errorMessage = "Falha ao fazer login. Verifique suas credenciais.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = "Email ou senha inválidos.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Formato de email inválido.";
      }
      setError(errorMessage);
      toast({
        title: "Erro de Login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // If auth is still loading or user is already authenticated, don't render form
  // (AuthContext handles redirection, this is an additional safeguard or could show a loader)
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LogIn className="h-8 w-8 animate-pulse text-primary" /></div>;
  }
  if (authUser) {
     // This case should ideally be handled by AuthContext redirecting away from /login
    return <div className="flex items-center justify-center min-h-screen">Redirecionando...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/20 p-4">
      <Card className="w-full max-w-md shadow-2xl glassmorphism border-primary/30">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-primary">
              <path d="M12.378 1.602a.75.75 0 00-.756 0L3.366 6.077a.75.75 0 00-.498.813l1.936 11.388a.75.75 0 00.582.613l5.529 1.908a.75.75 0 00.196.021h.012a.75.75 0 00.196-.021l5.529-1.908a.75.75 0 00.582-.613l1.936-11.388a.75.75 0 00-.498-.813L12.378 1.602zM12 7.5a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0V8.25A.75.75 0 0112 7.5zM11.25 15a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5h-1.5z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-headline">Nuvyra Admin</CardTitle>
          <CardDescription>Acesse o painel de controle</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@nuvyra.store"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-input/50 focus:bg-input/70"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-input/50 focus:bg-input/70"
              />
            </div>
            {error && (
              <div className="flex items-center p-3 text-sm rounded-md bg-destructive/20 text-destructive border border-destructive/50">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
              {loading ? (
                <>
                  <LogIn className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Em caso de problemas, contate o suporte.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
