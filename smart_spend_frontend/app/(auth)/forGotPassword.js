// app/(auth)/ForgotPassword.js
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
import { router } from "expo-router";
import React, { useRef, useState } from "react";

import { forgotPassword } from "../../app/services/api";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const toast = useToast();
  const timerRef = useRef(null);

  const sendResetCode = async (userEmail) => {
    setIsSendingCode(true);

    try {
      await forgotPassword(userEmail);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Send code error:", error);

      return {
        success: false,
        error: error.message || "Network error. Please try again.",
      };
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.show({
          placement: "top",
          render: () => (
            <Toast bg="$red500" action="error">
              <VStack space="xs">
                <ToastTitle color="$white">
                    Invalid Code
                </ToastTitle>

                <ToastDescription color="$white">
                    Please enter the 6-digit verification code
                </ToastDescription>
              </VStack>
            </Toast>
          )
      });

    return;
  }

    setShowSuccessModal(true);

    setTimeout(() => {
        setShowSuccessModal(false);

        router.push({
            pathname: "/(auth)/createNewpassword",
            params: {
                email,
                reset_code: verificationCode
            }
        });
    }, 1000);
  };


  const handleContinue = async () => {
    if (!email) {
      toast.show({
        placement: "top",
        render: () => (
          <Toast bg="$red500" action="error">
            <VStack space="xs">
              <ToastTitle color="$white">Error</ToastTitle>
              <ToastDescription color="$white">
                Please enter your email address
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.show({
        placement: "top",
        render: () => (
          <Toast bg="$red500" action="error">
            <VStack space="xs">
              <ToastTitle color="$white">Invalid Email</ToastTitle>
              <ToastDescription color="$white">
                Please enter a valid email address
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
      return;
    }

    const result = await sendResetCode(email);

    if (result.success) {
      setShowCodeInput(true);
      startTimer(60);

      toast.show({
        placement: "top",
        render: () => (
          <Toast bg="$green500" action="success">
            <VStack space="xs">
              <ToastTitle color="$white">Code Sent!</ToastTitle>
              <ToastDescription color="$white">
                "A verification code has been sent to your email"
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    } else {
      toast.show({
        placement: "top",
        render: () => (
          <Toast bg="$red500" action="error">
            <VStack space="xs">
              <ToastTitle color="$white">Error</ToastTitle>
              <ToastDescription color="$white">
                {result.error || "Failed to send reset code"}
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    }
  };

  const startTimer = (seconds) => {
    setTimer(seconds);
    setCanResend(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    const result = await sendResetCode(email);

    if (result.success) {
      startTimer(60);
      toast.show({
        placement: "top",
        render: () => (
          <Toast bg="$green500" action="success">
            <VStack space="xs">
              <ToastTitle color="$white">Code Resent!</ToastTitle>
              <ToastDescription color="$white">
                A new verification code has been sent
              </ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    }
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
       
        <Box bg="$white" width="100%" maxWidth="$96" p="$8" mx="auto">
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
                Reset Password
              </Heading>
              <Text size="sm" color="$textLight500" textAlign="center">
                {!showCodeInput
                  ? "Enter your email to receive a verification code"
                  : "Enter the 6-digit code sent to your email"}
              </Text>
            </VStack>
          </VStack>

          <VStack space="lg" mt="$6">
            <VStack space="xs">
              <Text color="$textLight900" size="sm">
                Email Address
              </Text>
              <Input
                variant="outlined"
                size="md"
                borderColor="$borderLight300"
                bg="$backgroundLight50"
                isDisabled={showCodeInput}
                opacity={showCodeInput ? 0.6 : 1}
              >
                <InputField
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Input>
            </VStack>

            {showCodeInput && (
              <VStack space="xs">
                <Text color="$textLight900" size="sm">
                  Verification Code
                </Text>
                <Input
                  variant="outlined"
                  size="md"
                  borderColor="$borderLight300"
                  bg="$backgroundLight50"
                >
                  <InputField
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </Input>

                <HStack
                  space="sm"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text size="xs" color="$textLight500">
                    {timer > 0
                      ? `Resend code in ${timer}s`
                      : "Didn't receive code?"}
                  </Text>
                  <Button
                    size="xs"
                    variant="link"
                    onPress={handleResendCode}
                    isDisabled={!canResend}
                    opacity={!canResend ? 0.5 : 1}
                  >
                    <ButtonText size="xs" color="#85BB65">
                      Resend Code
                    </ButtonText>
                  </Button>
                </HStack>
              </VStack>
            )}

            <Button
              bg="#85BB65"
              size="lg"
              onPress={showCodeInput ? handleVerifyCode : handleContinue}
              isDisabled={isLoading || isSendingCode}
              opacity={isLoading || isSendingCode ? 0.6 : 1}
            >
              <ButtonText>
                {isSendingCode
                  ? "Sending Code..."
                  : isLoading
                    ? "Verifying..."
                    : showCodeInput
                      ? "Verify & Continue"
                      : "Continue"}
              </ButtonText>
            </Button>

            <HStack space="sm" alignItems="center" justifyContent="center">
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
        onClose={() => {}}
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
                  Code Verified!
                </Heading>
                <Text textAlign="center" color="$textLight500">
                  Your account has been verified. Redirecting to create new
                  password...
                </Text>
              </VStack>
              <Text size="sm" color="$textLight400">
                Please wait...
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </GluestackUIProvider>
  );
}
