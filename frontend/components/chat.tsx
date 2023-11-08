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
  sender:
    | 'user'
    | 'SAP Senior Consultant'
    | 'SAP Solutions Architect'
    | 'SAP BTP Expert'
    | 'Error'
  text: string
}

// Helper function to determine the class based on the sender
function determineTitleClass(sender: any) {
  switch (sender) {
    case 'user':
      return 'text-purple-300'
    case 'SAP Senior Consultant':
      return 'text-amber-200'
    case 'SAP Solutions Architect':
      return 'text-blue-300'
    case 'SAP BTP Expert':
      return 'text-green-300'
    case 'Error':
      return 'text-red-300'
    default:
      return '' // Default case if needed
  }
}

export function Chat() {
  const [input, setInput] = useState('') // State to hold the input value
  const [isLoading, setIsLoading] = useState(false) // State to manage loading state
  const [messages, setMessages] = useState<ChatMessage[]>([]) // Use our ChatMessage type here
  const [result, setResult] = useState(null) // State to hold the backend response
  const containerRef = useRef<HTMLDivElement | null>(null)

  // handle form submit
  const handleSubmit = async (event: any) => {
    event.preventDefault() // Prevent the form from causing a page refresh
    setIsLoading(true) // Start loading

    // Add user input as a message
    const userInputMessage: ChatMessage = { sender: 'user', text: input }
    setMessages((prevMessages) => [...prevMessages, userInputMessage])

    try {
      const seniorConsultantResponse = await fetch(
        'http://localhost:8080/api/senior_consultant_post',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ consulting_question: input })
        }
      )

      if (!seniorConsultantResponse.ok) {
        throw new Error(
          `HTTP error! status: ${seniorConsultantResponse.status}`
        )
      }

      const seniorConsultantData = await seniorConsultantResponse.json()
      console.log(seniorConsultantData)

      const consultantResponseMessage: ChatMessage = {
        sender: 'SAP Senior Consultant',
        // Use HTML markup for line breaks
        text: `
          <p><strong>Scope:</strong> ${seniorConsultantData.scope}</p>
          <br></br>
          <p><strong>BTP Expert Task:</strong> ${seniorConsultantData.btp_expert_task}</p>
          <br></br>
          <p><strong>Solutions Architect Task:</strong> ${seniorConsultantData.solutions_architect_task}</p>
        `
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        consultantResponseMessage
      ])
      // ********** Function to handle BTP expert task independently **********
      const handleBTPExpertTask = async (task: any) => {
        const response = await fetch('http://localhost:8080/api/btp_expert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ btp_expert_task: task })
        })

        if (!response.ok) {
          throw new Error(
            `HTTP error from BTP Expert! Status: ${response.status}`
          )
        }

        const data = await response.json()
        console.log('BTP EXPERT DATA:' + data)

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'SAP BTP Expert', text: data.btp_expert_result }
        ])
      }
      // ********** END OF BTP EXPERT API CALL **********

      // ********** Function to handle Solutions Architect task independently **********
      const handleSolutionsArchitectTask = async (task: any) => {
        const response = await fetch(
          'http://localhost:8080/api/solutions_architect',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ solutions_architect_task: task })
          }
        )

        if (!response.ok) {
          throw new Error(
            `HTTP error from Solutions Architect! Status: ${response.status}`
          )
        }

        const data = await response.json()
        console.log('SOLUTIONS ARCHITECT DATA:' + data)

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'SAP Solutions Architect',
            text: data.solutions_architect_result
          }
        ])
      }
      // ********** END OF SOLUTIONS ARCHITECT API CALL **********

      // Start both tasks without waiting for them to complete
      if (seniorConsultantData.btp_expert_task) {
        handleBTPExpertTask(seniorConsultantData.btp_expert_task).catch(
          console.error
        )
      }
      if (seniorConsultantData.solutions_architect_task) {
        handleSolutionsArchitectTask(
          seniorConsultantData.solutions_architect_task
        ).catch(console.error)
      }
    } catch (error) {
      console.error('Error during fetch:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'Error',
          text: 'An error occurred while processing your request.'
        }
      ])
    } finally {
      setIsLoading(false)
      setInput('') // Clear input field
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
              <CardTitle className={determineTitleClass(message.sender)}>
                {message.sender === 'user' ? 'You' : message.sender}
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
