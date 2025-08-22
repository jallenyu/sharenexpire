import { Accordion, Space } from '@mantine/core';
import { faqData } from '../config';

export default function FaqPage() {
    const items = faqData.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Control>{item.value}</Accordion.Control>
            <Accordion.Panel>{item.description}</Accordion.Panel>
        </Accordion.Item>
    ));

    return (
        <>
            <h1 className='text-4xl font-bold text-center'>Frequently Asked Questions</h1>
            <Space h="md" />
            <Accordion variant="separated" defaultValue="What is ShareNExpire?">
                {items}
            </Accordion>
        </>
    );
}