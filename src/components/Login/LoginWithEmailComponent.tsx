import {
  Box,
  Button,
  Center,
  HStack,
  Input,
  Stack,
} from '@chakra-ui/react';

import { Checkbox } from '../../components/ui/checkbox'
import { Field } from '../../components/ui/field'
import { PinInput } from '../../components/ui/pin-input'
import { useState } from 'react';

export default function LoginWithEmailComponent() {
  const [showPinInput, setShowPinInput] = useState(false);

  const handleQQSubmit = () => {
    // 在这里触发发送验证码的逻辑
    // 然后显示验证码输入框
    setShowPinInput(true);
  };

  return (
    <Box
      rounded={'lg'}
      bg={{ base: 'white', _dark: 'gray.700' }}
      boxShadow={'lg'}
      p={8}>
      <Stack gap={4}>
        <Field label="QQ">
          <Input type="email" />
        </Field>
        {showPinInput && (
          <Field label="验证码">
            <Center>
              <HStack>
                <PinInput count={4} />
              </HStack>
            </Center>
          </Field>
        )}
        <Stack gap={10}>
          <Stack
            direction={{ base: 'column', sm: 'row' }}
            align={'start'}
            justify={'space-between'}>
            <Checkbox>记住我</Checkbox>
          </Stack>
          <Button
            onClick={handleQQSubmit}
            bg={'blue.400'}
            color={'white'}
            _hover={{
              bg: 'blue.500',
            }}>
            {showPinInput ? '提交验证码' : '获取验证码'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
