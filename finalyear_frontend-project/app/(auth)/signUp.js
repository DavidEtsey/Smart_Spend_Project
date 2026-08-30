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
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validate full name
    if (!fullName.trim()) {
      Alert.alert("Missing Information", "Please enter your full name.");
      return;
    }

    // Validate email
    if (!email.trim()) {
      Alert.alert("Missing Information", "Please enter your email.");
      return;
    }

    // Validate password
    if (!password) {
      Alert.alert("Missing Information", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending registration request...");
      console.log("API URL:", `${API_BASE_URL}/api/auth/user/register`);

      const response = await fetch(`${API_BASE_URL}/api/auth/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      // Try to parse JSON response
      const data = await response.json();

      console.log("Registration status:", response.status);

      console.log("Registration response:", data);

      // Handle unsuccessful response
      if (!response.ok) {
        throw new Error(data.error || data.message || "Registration failed");
      }

      // Registration successful
      Alert.alert(
        "Account Created",
        data.message || "User created successfully",
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(auth)/logIn");
            },
          },
        ],
      );
    } catch (error) {
      console.error("Registration error:", error);

      Alert.alert(
        "Registration Failed",
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
        width="$100%"
        height="100%"
      >
        <Box bg="$white" width="100%" maxWidth="$96" p="$8" mx="auto">
          {/* Header */}
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
                Create an Account
              </Heading>

              <Text size="sm" color="$textLight500">
                Fill in your details to get started
              </Text>
            </VStack>
          </VStack>

          {/* Form */}
          <VStack space="lg" mt="$6">
            {/* Full Name */}
            <VStack space="xs">
              <Text color="$textLight900" size="sm">
                Full Name
              </Text>

              <Input
                variant="outlined"
                size="md"
                borderColor="$borderLight300"
                bg="$backgroundLight50"
              >
                <InputField
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </Input>
            </VStack>

            {/* Email */}
            <VStack space="xs">
              <Text color="$textLight900" size="sm">
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
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </Input>
            </VStack>

            {/* Sign Up Button */}
            <Button
              bg="#85BB65"
              size="lg"
              onPress={handleSignUp}
              isDisabled={loading}
            >
              <ButtonText>
                {loading ? "Creating Account..." : "Sign Up"}
              </ButtonText>
            </Button>

            {/* Login */}
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Text size="sm" color="$textLight500">
                Already have an account?
              </Text>

              <Link href="/(auth)/logIn">
                <Text size="sm" color="#85BB65" fontWeight="$bold">
                  Sign In
                </Text>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </GluestackUIProvider>
  );
}
