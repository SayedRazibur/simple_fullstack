'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

const OTP = () => {
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifyOtp, forgotPassword } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!email) {
      navigate('/auth/forgot-password');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const onSubmit = async (data) => {
    setError('');
    setIsSubmitting(true);
    try {
      await verifyOtp(email, data.otp);
      toast.success('OTP verified successfully!');
      // Navigate to reset password page after OTP verification
      navigate('/auth/reset-password', {
        state: { email },
      });
    } catch (err) {
      const errorMessage = err?.message || 'Invalid OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      toast.success('OTP resent successfully!');
      setCountdown(60);
      setCanResend(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const errorMessage = err?.message || 'Failed to resend OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Enter OTP</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="text-center text-lg tracking-widest"
                {...register('otp', {
                  required: 'OTP is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'OTP must be 6 digits',
                  },
                })}
              />
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className="text-center">
              {canResend ? (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-sm"
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Resend OTP in {countdown}s
                </p>
              )}
            </div>

            <Link to="/auth/forgot-password">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTP;
