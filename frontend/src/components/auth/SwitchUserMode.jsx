import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { Input } from '../ui/input';
import { toast } from 'sonner';

const SwitchUserMode = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { switchToAdminMode, isAdmin, switchToNormalMode } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await switchToAdminMode(code);

    if (!success) {
      toast.error('Invalid admin code');
    } else {
      toast.success('Admin Mode On!');
    }
    setIsLoading(false);
  };

  return (
    <Dialog>
      {isAdmin ? (
        <Button variant="destructive" onClick={switchToNormalMode}>
          Switch to Normal Mode
        </Button>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline">Switch to Admin Mode</Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 pt-5">
            <div>
              <label htmlFor="code" className="sr-only">
                Admin Code
              </label>
              <Input
                id="code"
                name="code"
                type="password"
                required
                className="relative block w-full px-3 py-2  rounded-md text-center text-lg tracking-widest"
                placeholder="Enter admin code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-col gap-2">
            <DialogClose asChild>
              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full text-white bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Verifying...' : 'Enter Admin Mode'}
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SwitchUserMode;
