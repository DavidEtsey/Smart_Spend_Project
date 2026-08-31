import { config } from "@gluestack-ui/config";
import {
  Box,
  Button,
  ButtonText,
  GluestackUIProvider,
  Heading,
  HStack,
  Input,
  InputField,
  Link,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/authContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Login() {
  const { signIn } = useAuth();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter your email and password.",
      );
      return;
    }
    try {
      setLoading(true);
      console.log("Login URL:", `${API_BASE_URL}/api/auth/user/login`);

      const response = await fetch(`${API_BASE_URL}/api/auth/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();
      console.log("Login status:", response.status);
      console.log("FULL RESPONSE:", JSON.stringify(data)); // <-- important

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Invalid email or password",
        );
      }

      // FIX: Support multiple token names from backend
      const token =
        data.token || data.accessToken || data.access_token || data.data?.token;

      console.log("Extracted token:", token);

      if (!token) {
        console.log("Available keys:", Object.keys(data));
        throw new Error("Authentication token was not received.");
      }

      await signIn({
        token,
        userData: data.user || null,
      });

      console.log("Login successful.");
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error?.message || "Unable to connect to the server.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GluestackUIProvider config={config}>
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg="$white"
        width="100%"
        height="100%"
      >
        <Box bg="$white" width="100%" maxWidth="$96" p="$8">
          {/* Logo and Header */}
          <VStack alignItems="center" space="md">
            <HStack alignItems="center" justifyContent="center" space="sm">
              <Heading
                size="$2xl"
                color="#85BB65"
                fontWeight="$extrabold"
                letterSpacing={2}
              >
                Smart
                <Text fontStyle="italic" color="#FFDD00">
                  Spend
                </Text>
              </Heading>
            </HStack>

            <VStack alignItems="center" space="xs">
              <Heading color="$textLight900" size="lg">
                Welcome Back
              </Heading>

              <Text size="sm" color="$textLight500">
                Sign in to continue
              </Text>
            </VStack>
          </VStack>

          {/* Login Form */}
          <VStack space="lg" mt="$6">
            {/* Email */}
            <VStack space="xs">
              <Text color="$textLight500" size="sm">
                Email
              </Text>

              <Input
                variant="outlined"
                size="md"
                borderColor="$borderLight300"
                bg="$backgroundLight50"
              >
                <InputField
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            </VStack>

            {/* Password */}
            <VStack space="xs">
              <Text color="$textLight900" size="sm">
                Password
              </Text>

              <Input
                variant="outlined"
                size="md"
                borderColor="$borderLight300"
                bg="$backgroundLight50"
              >
                <InputField
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            </VStack>

            {/* Forgot Password */}
            <Link
              alignSelf="flex-end"
              onPress={() => router.push("/forGotPassword")}
            >
              <Text size="sm" color="#85BB65">
                Forgot Password
              </Text>
            </Link>

            {/* Login Button */}
            <Button
              bg="#85BB65"
              size="lg"
              onPress={handleLogin}
              isDisabled={loading}
            >
              <ButtonText>{loading ? "Signing In..." : "Sign In"}</ButtonText>
            </Button>

            {/* Sign Up */}
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Text size="sm" color="$textLight500">
                Don&apos;t have an account?
              </Text>

              <Link onPress={() => router.push("/(auth)/signUp")}>
                <Text size="sm" color="#85BB65" fontWeight="$bold">
                  Sign Up
                </Text>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </GluestackUIProvider>
  );
}
