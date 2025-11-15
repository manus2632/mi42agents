import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');

    if (!tokenParam) {
      setVerifying(false);
      setResult({
        success: false,
        message: 'No verification token provided',
      });
      return;
    }

    setToken(tokenParam);

    // Verify token
    verifyMutation.mutate(
      { token: tokenParam },
      {
        onSuccess: (data) => {
          setVerifying(false);
          setResult(data);
        },
        onError: (error) => {
          setVerifying(false);
          setResult({
            success: false,
            message: error.message || 'Verification failed',
          });
        },
      }
    );
  }, []);

  const handleContinue = () => {
    setLocation('/login-standalone.html');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {verifying ? (
              <Loader2 className="w-16 h-16 text-gray-400 animate-spin" />
            ) : result?.success ? (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {verifying
              ? 'Verifying your email...'
              : result?.success
              ? 'Email Verified!'
              : 'Verification Failed'}
          </CardTitle>
          <CardDescription>
            {verifying
              ? 'Please wait while we verify your email address'
              : result?.message}
          </CardDescription>
        </CardHeader>

        {!verifying && (
          <CardContent className="space-y-4">
            {result?.success ? (
              <>
                <p className="text-sm text-gray-600 text-center">
                  Your email has been successfully verified. You can now log in to your Mi42 account and access your personalized market analyses.
                </p>
                <Button onClick={handleContinue} className="w-full">
                  Continue to Login
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 text-center">
                  The verification link may have expired or is invalid. Please try registering again or contact support if the problem persists.
                </p>
                <Button onClick={() => setLocation('/')} variant="outline" className="w-full">
                  Back to Home
                </Button>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
