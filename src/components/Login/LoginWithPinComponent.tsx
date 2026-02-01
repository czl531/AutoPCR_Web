import {
    Box,
    Button,
    Clipboard,
    Code,
    HStack,
    Stack,
    Text,
} from '@chakra-ui/react'

import { PinInput } from '../../components/ui/pin-input';
import { getLoginPin } from '@api/Login';
import { useState } from 'react';

export default function LoginWithPinComponent() {

    const [pin, setPin] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [copyValue, setCopyValue] = useState("");

    const generatePin = async () => {
        setLoading(true);
        try {
            const res = await getLoginPin();
            setCopyValue("#login " + res);
            setPin(res);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            rounded={'lg'}
            bg="bg.panel"
            boxShadow={'lg'}
            p={8}>

            {!pin || !copyValue ? <Button onClick={generatePin} loading={loading} >生成PIN码</Button> :
                <Stack gap={4}>
                    <Text> 请于60s内在相应Q群发送</Text>
                    <Code> #login xxxx </Code>
                    <HStack gap={4}>
                        <PinInput disabled value={pin ? pin.split('') : []} count={4} />
                    </HStack>
                    <Clipboard.Root value={copyValue}>
                        <Clipboard.Trigger asChild>
                            <Button>Copy</Button>
                        </Clipboard.Trigger>
                        <Clipboard.Indicator>Copied!</Clipboard.Indicator>
                    </Clipboard.Root>
                </Stack>
            }
        </Box>
    )
}
