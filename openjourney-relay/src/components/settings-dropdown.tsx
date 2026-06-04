"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SettingsIcon } from "lucide-react";

export function SettingsDropdown() {
  const [apiKey, setApiKey] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    // Function to load API key from localStorage
    const loadApiKey = () => {
      const savedApiKey = localStorage.getItem("relay_api_key");
      setApiKey(savedApiKey || "");
    };

    // Load saved API key from localStorage
    loadApiKey();

    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem("framemint-dark-mode");
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true");
    }

    // Listen for API key updates from other components (like the dialog)
    const handleApiKeyUpdate = () => {
      loadApiKey();
    };

    window.addEventListener('apiKeyUpdated', handleApiKeyUpdate);

    // Cleanup event listener
    return () => {
      window.removeEventListener('apiKeyUpdated', handleApiKeyUpdate);
    };
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem("relay_api_key", value);
    
    // Show save confirmation
    if (value.trim()) {
      setSaveStatus("Relay key saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus(null);
    }
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("framemint-dark-mode", checked.toString());
    
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleClearApiKey = () => {
    setApiKey("");
    localStorage.removeItem("relay_api_key");
    setSaveStatus("Relay key cleared");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <SettingsIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-4">
        <div className="space-y-4">
          {/* API Key Section */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium">
              Relay Provider Keys
            </Label>
            <div className="space-y-2">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="Provider key or backend token..."
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="text-xs"
              />
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-xs h-7"
                >
                  {showApiKey ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearApiKey}
                  className="text-xs h-7"
                >
                  Clear
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep provider secrets on your backend. Architecture reference:{" "}
              <a
                href="https://github.com/samagra14/mediagateway"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                MediaRouter
              </a>
            </p>
            {saveStatus && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {saveStatus}
              </p>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Dark Mode Section */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="dark-mode" className="text-sm font-medium">
              Dark mode
            </Label>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          {/* GitHub Section */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://github.com/ammaarreshi/openjourney", "_blank")}
              className="w-full text-sm"
            >
              Open source base
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
