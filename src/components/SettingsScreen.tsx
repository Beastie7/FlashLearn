import React from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { NeonButton } from './NeonButton';
import { ArrowLeft, Moon, Sun, Bell, User, Shield, HelpCircle, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface SettingsScreenProps {
  onBack: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  user?: any;
  isDeleting?: boolean;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onSignOut, onDeleteAccount, user, isDeleting = false }) => {
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cyber-bg)] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          {user && (
            <Card className="cyber-surface p-6 neon-border-blue">
              <h3 className="mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Account
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 cyber-gradient rounded-full flex items-center justify-center neon-glow-blue">
                    <span className="text-white text-lg">
                      {user.user_metadata?.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p>{user.user_metadata?.name || 'FlashLearn User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <NeonButton
                  variant="secondary"
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </NeonButton>
              </div>
            </Card>
          )}

          {/* Appearance */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <h3 className="mb-4 flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' ? 'Enabled' : 'Disabled'} - Futuristic cyber aesthetic
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </Card>

          {/* Study Preferences */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <h3 className="mb-4">Study Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Shuffle cards</p>
                  <p className="text-sm text-muted-foreground">
                    Randomize card order during study sessions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Help & Support */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <h3 className="mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Help & Support
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                <p>How to Use FlashLearn</p>
                <p className="text-sm text-muted-foreground">Learn about features and best practices</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                <p>Contact Support</p>
                <p className="text-sm text-muted-foreground">Get help with technical issues</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-secondary/20 transition-colors">
                <p>Privacy Policy</p>
                <p className="text-sm text-muted-foreground">How we protect your data</p>
              </button>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <h3 className="mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Help improve FlashLearn with usage data
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p>Crash reporting</p>
                  <p className="text-sm text-muted-foreground">
                    Send error reports to help fix bugs
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Delete Account - Danger Zone */}
          <Card className="cyber-surface p-6 neon-border-red border-2">
            <h3 className="mb-4 flex items-center gap-2 text-red-500">
              <Trash2 className="w-5 h-5" />
              Danger Zone
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-red-500 font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account, all your decks, cards, and progress. This action cannot be undone.
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <NeonButton
                    variant="destructive"
                    className="flex items-center gap-2 w-full justify-center"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                  </NeonButton>
                </AlertDialogTrigger>
                <AlertDialogContent className="cyber-surface neon-border-red">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                      This action <span className="text-red-500 font-medium">cannot be undone</span>.
                      This will permanently delete your account and remove all of your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      The following will be permanently deleted:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>Your FlashLearn account</li>
                      <li>All your flashcard decks</li>
                      <li>All your flashcards and progress</li>
                      <li>Your study statistics and streaks</li>
                    </ul>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border hover:bg-secondary">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.preventDefault();
                        onDeleteAccount();
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>

          {/* App Info */}
          <Card className="cyber-surface p-6 neon-border-blue">
            <div className="text-center space-y-2">
              <div className="cyber-gradient w-12 h-12 rounded-full mx-auto flex items-center justify-center neon-glow-blue mb-4">
                <span className="text-white">FL</span>
              </div>
              <h4>FlashLearn</h4>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
              <p className="text-xs text-muted-foreground">
                AI-Powered Flashcards for Smarter Learning
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};