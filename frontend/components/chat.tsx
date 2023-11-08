'use client'
import Balancer from 'react-wrap-balancer'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { useEffect, useRef, useState } from 'react'
import { SeniorConsultantUI } from './seniorConsultantUi'

type ChatMessage = {
  sender: 'user' | 'SAP Senior Consultant'
  text: string
}

export function Chat() {
  const [input, setInput] = useState('') // State to hold the input value
  const [isLoading, setIsLoading] = useState(false) // State to manage loading state
  const [messages, setMessages] = useState<ChatMessage[]>([]) // Use our ChatMessage type here
  const [result, setResult] = useState(null) // State to hold the backend response

  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleSubmit = async (event: any) => {
    event.preventDefault() // Prevent the form from causing a page refresh
    setIsLoading(true) // Start loading

    // Add user input as a message
    const userInputMessage: ChatMessage = { sender: 'user', text: input }
    setMessages((prevMessages) => [...prevMessages, userInputMessage])

    try {
      const response = await fetch(
        'http://localhost:8080/api/senior_consultant_post',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ consulting_question: input })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(data)

      const consultantResponseMessage: ChatMessage = {
        sender: 'SAP Senior Consultant',
        // Use HTML markup for line breaks
        text: `
          <p><strong>BTP Expert Task:</strong> ${data.btp_expert_task}</p>
          <br></br>
          <p><strong>Solutions Architect Task:</strong> ${data.solutions_architect_task}</p>
        `
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        consultantResponseMessage
      ])
    } catch (error) {
      console.error('Error during fetch:', error)
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  return (
    <div className='rounded-2xl border h-[75vh] flex flex-col justify-between'>
      <div className='p-6 overflow-auto' ref={containerRef}>
        {SeniorConsultantUI()}
        {messages.map((message, index) => (
          <Card key={index} className='mb-2'>
            <CardHeader>
              <CardTitle
                className={
                  message.sender === 'user'
                    ? 'text-purple-300'
                    : 'text-amber-200'
                }
              >
                {message.sender === 'user' ? 'You' : 'SAP Senior Consultant'}
              </CardTitle>
            </CardHeader>
            <CardContent
              className='text-sm'
              dangerouslySetInnerHTML={{ __html: message.text }}
            >
              {/* Message text is inserted via dangerouslySetInnerHTML */}
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className='p-4 flex clear-both'>
        <Input
          value={input}
          placeholder={'Type to chat with our professionals from SAP...'}
          onChange={handleInputChange}
          className='mr-2'
        />

        <Button type='submit' className='w-24'>
          {isLoading ? <Spinner /> : 'Ask'}
        </Button>
      </form>
    </div>
  )
}
