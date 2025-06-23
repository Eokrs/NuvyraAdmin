
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user: authUser, loading: authLoading, signInWithEmail } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await signInWithEmail(email, password);
      if (signInError) {
        let errorMessage = "Falha ao fazer login. Verifique suas credenciais.";
        // Supabase error codes might differ, adjust as needed
        // Example: if (signInError.message.includes("Invalid login credentials"))
        if (signInError.message.toLowerCase().includes('invalid login credentials')) {
           errorMessage = "Email ou senha inválidos.";
        } else if (signInError.message.toLowerCase().includes('email not confirmed')) {
            errorMessage = "Por favor, confirme seu email antes de fazer login.";
        }
        setError(errorMessage);
        toast({
          title: "Erro de Login",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login bem-sucedido!",
          description: "Redirecionando para o painel...",
        });
        // AuthContext will handle redirect via its useEffect or onAuthStateChange
      }
    } catch (err: any) {
      console.error("Login Page Error:", err);
      const errorMessage = "Ocorreu um erro inesperado durante o login.";
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
  
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LogIn className="h-8 w-8 animate-pulse text-primary" /></div>;
  }
  // AuthContext handles redirection if user is already authenticated
  // So, if we reach here and authUser exists, it's likely a brief moment before redirection
  // or a state mismatch. Rely on AuthContext's useEffect for consistent redirection.

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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading || authLoading}>
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
