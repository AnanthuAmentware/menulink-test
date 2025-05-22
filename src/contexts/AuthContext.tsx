import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, onAuthStateChanged } from '../lib/firebase';
import type { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'owner' | 'admin' | 'none';

interface AuthContextProps {
  currentUser: User | null;
  userRole: UserRole;
  isAdmin: boolean;
  isOwner: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
  userRole: 'none',
  isAdmin: false,
  isOwner: false,
  isAuthenticated: false,
  loading: true,
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if user is admin (In a real app, you'd check custom claims or a Firestore document)
        // For demo purposes, we're considering a specific UID as admin
        const isAdmin = user.uid === 'admin123' || (await user.getIdTokenResult()).claims.admin === true;
        setUserRole(isAdmin ? 'admin' : 'owner');
      } else {
        setUserRole('none');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logged out successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = userRole === 'admin';
  const isOwner = userRole === 'owner';
  const isAuthenticated = currentUser !== null;

  const value = {
    currentUser,
    userRole,
    isAdmin,
    isOwner,
    isAuthenticated,
    loading,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
