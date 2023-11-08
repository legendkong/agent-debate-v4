import Balancer from 'react-wrap-balancer'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from './ui/accordion'
import { Message } from 'ai/react'
import ReactMarkdown from 'react-markdown'
import { formattedText } from '../lib/utils'

// const convertNewLines = (text: string) =>
//   text.split('\n').map((line, i) => (
//     <span key={i}>
//       {line}
//       <br />
//     </span>
//   ))

interface ChatLineProps extends Partial<Message> {
  sources: string[]
}

export function SeniorConsultantUI() {
  return (
    <div>
      <Card className='mb-2'>
        <CardHeader>
          <CardTitle className={'text-amber-200 dark:text-amber-200'}>
            SAP Senior Consultant
          </CardTitle>
        </CardHeader>
        <CardContent className='text-sm'>
          <Balancer>
            Hey there! Please ask your consulting question and let our team
            handle the rest.
          </Balancer>
        </CardContent>
        {/* <CardFooter>
          <CardDescription className='w-full'></CardDescription>
        </CardFooter> */}
      </Card>
    </div>
  )
}
