import { config } from "@gluestack-ui/config";
import {
  Box,
  Button,
  ButtonText,
  EyeIcon,
  EyeOffIcon,
  GluestackUIProvider,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Link,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  Text,
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
  VStack,
} from "@gluestack-ui/themed";
import { useLocalSearchParams,router } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { resetPassword } from "../../app/services/api";

// API Configuration

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateNewPassword() {
  const { email, reset_code } = useLocalSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
 

  const toast = useToast();
  const autoCloseTimerRef = useRef(null);

  /*
  // reset data from global storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = window._resetEmail;
      const storedToken = window._resetToken;

      if (storedEmail && storedToken) {
        setEmail(storedEmail);
        setResetToken(storedToken);
      } else {
        // No reset session - redirect back to forgot password
        toast.show({
          placement: "top",
          render: () => (
            <Toast bg="$red500" action="error">
              <VStack space="xs">
                <ToastTitle color="$white">Session Expired</ToastTitle>
                <ToastDescription color="$white">
                  Please request a new reset code
                </ToastDescription>
              </VStack>
            </Toast>
          ),
        });
        setTimeout(() => {
          router.replace("/(auth)/forGotPassword");
            router.replace("/forGotPassword");
        }, 1500);
      }
    }
  }, []);
  */

  const handleCreatePassword = async () => {
    if (!newPassword || !confirmPassword) {
        toast.show({
            placement: "top",
            render: () => (
                <Toast bg="$red500" action="error">
                    <VStack space="xs">
                        <ToastTitle color="$white">
                            Error
                        </ToastTitle>

                        <ToastDescription color="$white">
                            Please fill in all fields
                        </ToastDescription>
                    </VStack>
                </Toast>
            )
        });

        return;
    }

    if (newPassword.length < 8) {
        toast.show({
            placement: "top",
            render: () => (
                <Toast bg="$red500" action="error">
                    <VStack space="xs">
                        <ToastTitle color="$white">
                            Error
                        </ToastTitle>

                        <ToastDescription color="$white">
                            Password must be at least 8 characters
                        </ToastDescription>
                    </VStack>
                </Toast>
            )
        });

        return;
    }

    if (newPassword !== confirmPassword) {
        toast.show({
            placement: "top",
            render: () => (
                <Toast bg="$red500" action="error">
                    <VStack space="xs">
                        <ToastTitle color="$white">
                            Error
                        </ToastTitle>

                        <ToastDescription color="$white">
                            Passwords do not match
                        </ToastDescription>
                    </VStack>
                </Toast>
            )
        });

        return;
    }

    if (!email || !reset_code) {
        toast.show({
            placement: "top",
            render: () => (
                <Toast bg="$red500" action="error">
                    <VStack space="xs">
                        <ToastTitle color="$white">
                            Reset Session Expired
                        </ToastTitle>

                        <ToastDescription color="$white">
                            Please request a new password reset code.
                        </ToastDescription>
                    </VStack>
                </Toast>
            )
        });

        router.replace("/(auth)/forGotPassword");
        return;
    }

    setIsLoading(true);

    try {
        await resetPassword(
            email,
            reset_code,
            newPassword
        );

        setShowSuccessModal(true);

        autoCloseTimerRef.current = setTimeout(() => {
            setShowSuccessModal(false);
            router.replace("/(auth)/logIn");
        }, 3000);

    } catch (error) {
        console.error("Reset password error:", error);

        toast.show({
            placement: "top",
            render: () => (
                <Toast bg="$red500" action="error">
                    <VStack space="xs">
                        <ToastTitle color="$white">
                            Error
                        </ToastTitle>

                        <ToastDescription color="$white">
                            {error.message || "Failed to reset password"}
                        </ToastDescription>
                    </VStack>
                </Toast>
            )
        });

    } finally {
        setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setShowSuccessModal(false);
    setTimeout(() => {
      router.replace("/(auth)/logIn");
    }, 200);
  };

  // Clean up timer
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <GluestackUIProvider config={config}>
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100%"
      >
        <Box width="100%" maxWidth="$96" p="$8" mx="auto">
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
                Create New Password
              </Heading>
              <Text size="sm" color="$textLight500" textAlign="center">
                {email
                  ? `Creating new password for ${email}`
                  : "Your new password must be different from previous passwords"}
              </Text>
            </VStack>
          </VStack>

          <VStack space="lg" mt="$6">
            <VStack space="xs">
              <Text color="$textLight900" size="sm">
                New password
              </Text>
              <Input
                variant="outlined"
                size="md"
                borderColor="$borderLight300"
                bg="$backgroundLight50"
              >
                <InputField
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <Button
                  size="xs"
                  bg="transparent"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  $active-bg="transparent"
                >
                  <Icon
                    as={showNewPassword ? EyeIcon : EyeOffIcon}
                    size="sm"
                    color="$textLight500"
                  />
                </Button>
              </Input>
              <Text size="xs" color="$textLight500">
                Password must be at least 8 characters
              </Text>
            </VStack>

            <VStack space="xs">
              <Text color="$textLight900" size="sm">
                Confirm Password
              </Text>
              <Input
                variant="outlined"
                size="md"
                borderColor="$borderLight300"
                bg="$backgroundLight50"
              >
                <InputField
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <Button
                  size="xs"
                  bg="transparent"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  $active-bg="transparent"
                >
                  <Icon
                    as={showConfirmPassword ? EyeIcon : EyeOffIcon}
                    size="sm"
                    color="$textLight500"
                  />
                </Button>
              </Input>
              {confirmPassword && newPassword !== confirmPassword && (
                <Text size="xs" color="$red500">
                  Passwords do not match
                </Text>
              )}
            </VStack>

            {newPassword && (
              <VStack space="xs">
                <Text size="xs" color="$textLight500">
                  Password Strength:
                </Text>
                <HStack space="xs" alignItems="center">
                  <Box
                    h="$0.5"
                    flex={1}
                    bg={
                      newPassword.length < 4
                        ? "$red500"
                        : newPassword.length < 8
                          ? "$yellow500"
                          : "$green500"
                    }
                  />
                  <Text
                    size="xs"
                    color={
                      newPassword.length < 4
                        ? "$red500"
                        : newPassword.length < 8
                          ? "$yellow500"
                          : "$green500"
                    }
                  >
                    {newPassword.length < 4
                      ? "Weak"
                      : newPassword.length < 8
                        ? "Medium"
                        : "Strong"}
                  </Text>
                </HStack>
              </VStack>
            )}

            <Button
              bg="#85BB65"
              size="lg"
              onPress={handleCreatePassword}
              isDisabled={isLoading}
              opacity={isLoading ? 0.6 : 1}
            >
              <ButtonText>
                {isLoading ? "Creating Password..." : "Create Password"}
              </ButtonText>
            </Button>

            <HStack size="sm" color="$textLight500" justifyContent="center">
              <Text size="sm" color="$textLight500">
                Remember your password?
              </Text>
              <Link onPress={() => router.push("/(auth)/logIn")}>
                <Text size="sm" color="#85BB65" fontWeight="$bold">
                  Back to Login
                </Text>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          if (autoCloseTimerRef.current) {
            clearTimeout(autoCloseTimerRef.current);
            autoCloseTimerRef.current = null;
          }
          setShowSuccessModal(false);
        }}
        closeOnOverlayClick={false}
      >
        <ModalBackdrop />
        <ModalContent maxWidth="$96" borderRadius="$lg">
          <ModalBody p="$6">
            <VStack space="$4" alignItems="center">
              <Box
                w="$16"
                h="$16"
                borderRadius="$full"
                bg="$green100"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="$4xl" color="$green500">
                  ✓
                </Text>
              </Box>
              <VStack space="$2" alignItems="center">
                <Heading size="md" textAlign="center">
                  Password Created!
                </Heading>
                <Text textAlign="center" color="$textLight500">
                  Your password has been changed successfully.
                </Text>
              </VStack>
              <Text size="sm" color="$textLight400">
                Redirecting to login...
              </Text>
              <Button
                variant="outline"
                borderColor="$green500"
                onPress={handleSignIn}
                width="$full"
                mt="$2"
              >
                <ButtonText size="sm" color="#85BB65" fontWeight="$bold">
                  Sign In
                </ButtonText>
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </GluestackUIProvider>
  );
}
