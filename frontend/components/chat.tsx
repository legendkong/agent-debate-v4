'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { useRef, useState, useEffect } from 'react'
import { SeniorConsultantUI } from './seniorConsultantUi'

type ChatMessage = {
  sender:
    | 'user'
    | 'SAP Senior Consultant'
    | 'SAP Solutions Architect'
    | 'SAP BTP Expert'
    | 'Moderator'
    | 'Error'
  text: string
}

// Helper function to determine the class based on the sender
function determineTitleClass(sender: any) {
  switch (sender) {
    case 'user':
      return 'text-orange-400'
    case 'SAP Senior Consultant':
      return 'text-violet-400'
    case 'SAP Solutions Architect':
      return 'text-blue-300'
    case 'SAP BTP Expert':
      return 'text-green-300'
    case 'Moderator':
      return 'text-amber-200 bg-blue-950'
    case 'Error':
      return 'text-red-300'
    default:
      return '' // Default case if needed
  }
}

// Function to format BTP Expert response
function formatBTPExpertResponse(text: any) {
  // Replacing newline characters (\n) with HTML line breaks (<br />)
  const formattedText = text.replace(/\\n/g, '<br />')
  console.log('Formatted Text:', formattedText)
  return formattedText
}

// Function to format Solutions Architect response
function formatSolutionsArchitectResponse(text: any) {
  // This regex looks for patterns like "1.", "2.", etc., and inserts a line break before them
  let formattedText = text.replace(/(\d+)\./g, '<br /><br />$1.')

  // Additional formatting for bullet points with inline styling for indentation
  formattedText = formattedText.replace(
    / - /g,
    '<br /><span style="padding-left: 20px;">&bull; </span>' // Inline style for indentation
  )

  // Formatting for 'Note:'
  formattedText = formattedText.replace(
    /Note:/g,
    '<br /><br /><strong>Note:</strong>'
  )
  return formattedText
}

export function Chat() {
  const [input, setInput] = useState('') // State to hold the input value
  const [isLoading, setIsLoading] = useState(false) // State to manage loading state
  const [messages, setMessages] = useState<ChatMessage[]>([]) // Use our ChatMessage type here
  const [btpExpertOutput, setBtpExpertOutput] = useState('')
  const [saOutput, setSaOutput] = useState('')
  const [BTPExpertTask, setBTPExpertTask] = useState('')
  const [SATask, setSATask] = useState('')
  const [isRefinementNeeded, setIsRefinementNeeded] = useState(false)
  const [refinementCount, setRefinementCount] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // useEffect hook to trigger the review when both outputs are ready
  useEffect(() => {
    if (btpExpertOutput && saOutput) {
      handleReviewBySeniorConsultant()
    }
  }, [btpExpertOutput, saOutput])

  // handle form submit
  const handleSubmit = async (event: any) => {
    event.preventDefault() // Prevent the form from causing a page refresh
    setIsLoading(true) // Start loading

    // Add user input as a message
    const userInputMessage: ChatMessage = { sender: 'user', text: input }
    setMessages((prevMessages) => [...prevMessages, userInputMessage])

    // Add a loading message for Senior Consultant
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'SAP Senior Consultant',
        text: '🙋‍♂️🙋‍♀️ Assigning tasks ...'
      }
    ])

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
      console.log('Senior Consultant Data:' + seniorConsultantData)

      // const consultantResponseMessage: ChatMessage = {
      //   sender: 'SAP Senior Consultant',
      //   // Use HTML markup for line breaks
      //   text: `
      //     <p><strong>Scope:</strong> ${seniorConsultantData.scope}</p>
      //     <br></br>
      //     <p><strong>BTP Expert Task:</strong> ${seniorConsultantData.btp_expert_task}</p>
      //     <br></br>
      //     <p><strong>Solutions Architect Task:</strong> ${seniorConsultantData.solutions_architect_task}</p>
      //   `
      // }

      setMessages((prevMessages) => [
        ...prevMessages.filter(
          (msg) => msg.text !== '🙋‍♂️🙋‍♀️ Assigning tasks ...'
        ),
        {
          sender: 'SAP Senior Consultant',
          text: `
            <p><strong>Scope:</strong> ${seniorConsultantData.scope}</p>
            <br></br>
            <p><strong>BTP Expert Task:</strong> ${seniorConsultantData.btp_expert_task}</p>
            <br></br>
            <p><strong>Solutions Architect Task:</strong> ${seniorConsultantData.solutions_architect_task}</p>
          `
        }
      ])

      setBTPExpertTask(seniorConsultantData.btp_expert_task)
      setSATask(seniorConsultantData.solutions_architect_task)

      // setMessages((prevMessages) => [
      //   // ...prevMessages,
      //   // consultantResponseMessage

      // ])
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.text !== '🙋‍♂️🙋‍♀️ Assigning tasks ...')
      ])
      // ********** Function to handle BTP expert task independently **********
      // const handleBTPExpertTask = async (task: any) => {
      //   const response = await fetch(
      //     'http://localhost:8080/api/mock_btp_expert',
      //     {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify({ btp_expert_task: task })
      //     }
      //   )

      //   if (!response.ok) {
      //     throw new Error(
      //       `HTTP error from BTP Expert! Status: ${response.status}`
      //     )
      //   }

      //   const data = await response.json()
      //   console.log('BTP EXPERT DATA:' + data.btp_expert_result)
      //   setBtpExpertOutput(data.btp_expert_result)
      //   setMessages((prevMessages) => [
      //     ...prevMessages,
      //     {
      //       sender: 'SAP BTP Expert',
      //       // text: formatBTPExpertResponse(data.btp_expert_result)
      //       text: formatSolutionsArchitectResponse(data.btp_expert_result)
      //     }
      //   ])
      // }
      const handleBTPExpertTask = async (task: any) => {
        // Add a loading message for BTP Expert
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'SAP BTP Expert',
            text: '⌛️🔃 Searching for information ...'
          }
        ])

        try {
          const response = await fetch(
            'http://localhost:8080/api/mock_btp_expert',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ btp_expert_task: task })
            }
          )

          if (!response.ok) {
            throw new Error(
              `HTTP error from BTP Expert! Status: ${response.status}`
            )
          }

          const data = await response.json()
          setBtpExpertOutput(data.btp_expert_result)
          console.log('BTP EXPERT DATA:' + data.btp_expert_result)

          // Remove the loading message and add the actual response
          setMessages((prevMessages) => [
            ...prevMessages.filter(
              (msg) => msg.text !== '⌛️🔃 Searching for information ...'
            ),
            {
              sender: 'SAP BTP Expert',
              text: formatSolutionsArchitectResponse(data.btp_expert_result)
            }
          ])
        } catch (error) {
          console.error('Error from BTP Expert:', error)
          // Update messages to show error and remove the loading message
          setMessages((prevMessages) => [
            ...prevMessages.filter(
              (msg) => msg.text !== `⌛️🔃 Searching for information ... `
            )
          ])
        }
      }

      // ********** END OF BTP EXPERT API CALL **********

      // ********** Function to handle Solutions Architect task independently **********
      // const handleSolutionsArchitectTask = async (task: any) => {
      //   const response = await fetch(
      //     'http://localhost:8080/api/solutions_architect',
      //     {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify({ solutions_architect_task: task })
      //     }
      //   )

      //   if (!response.ok) {
      //     throw new Error(
      //       `HTTP error from Solutions Architect! Status: ${response.status}`
      //     )
      //   }

      //   const data = await response.json()
      //   console.log(
      //     'SOLUTIONS ARCHITECT DATA:' + data.solutions_architect_result
      //   )
      //   setSaOutput(data.solutions_architect_result)
      //   setMessages((prevMessages) => [
      //     ...prevMessages,
      //     {
      //       sender: 'SAP Solutions Architect',
      //       text: formatSolutionsArchitectResponse(
      //         data.solutions_architect_result
      //       )
      //     }
      //   ])
      // }
      const handleSolutionsArchitectTask = async (task: any) => {
        // Add a loading message for Solutions Architect
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'SAP Solutions Architect',
            text: '⌛️🔃 Searching for information ...'
          }
        ])

        try {
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
          console.log(
            'SOLUTIONS ARCHITECT DATA:',
            data.solutions_architect_result
          )
          setSaOutput(data.solutions_architect_result)

          // Remove the loading message and add the actual response
          setMessages((prevMessages) => [
            ...prevMessages.filter(
              (msg) => msg.text !== '⌛️🔃 Searching for information ...'
            ),
            {
              sender: 'SAP Solutions Architect',
              text: formatSolutionsArchitectResponse(
                data.solutions_architect_result
              )
            }
          ])
        } catch (error) {
          console.error('Error from Solutions Architect:', error)
          // Update messages to show error and remove the loading message
          setMessages((prevMessages) => [
            ...prevMessages.filter(
              (msg) => msg.text !== '⌛️🔃 Searching for information ...'
            ),
            {
              sender: 'Error',
              text: 'An error occurred during the Solutions Architect processing.'
            }
          ])
        }
      }

      // ********** END OF SOLUTIONS ARCHITECT API CALL **********

      // Start both tasks without waiting for them to complete
      if (seniorConsultantData.btp_expert_task) {
        console.log('Handling BTP Expert Task')
        handleBTPExpertTask(seniorConsultantData.btp_expert_task).catch(
          console.error
        )
      }
      if (seniorConsultantData.solutions_architect_task) {
        console.log('Handling Solutions Architect Task')
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

  // Function to handle review by v2SAPSeniorConsultant
  const handleReviewBySeniorConsultant = async () => {
    console.log('In handleReviewBySeniorConsultant function')
    // Only proceed if both outputs are available
    if (!btpExpertOutput || !saOutput) {
      console.error(
        'Waiting for outputs from BTP Expert and Solutions Architect.'
      )
      return // Consider adding some user feedback here
    }

    // Add a loading message for Senior Consultant
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'SAP Senior Consultant',
        text: '🧠 Looking through the solutions and gathering feedback ...'
      }
    ])

    try {
      const reviewResponse = await fetch(
        'http://localhost:8080/api/v2_senior_consultant',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            consulting_question: input,
            btp_expert_output: btpExpertOutput,
            solutions_architect_output: saOutput
          })
        }
      )

      if (!reviewResponse.ok) {
        throw new Error(`HTTP error! Status: ${reviewResponse.status}`)
      }

      const reviewData = await reviewResponse.json()
      console.log('Reviewed data by senior consultant:' + reviewData)
      console.log('Overall feedback:' + reviewData.overall_feedback)
      console.log(
        'Critique for BTP expert:' +
          reviewData.overall_feedback['Critique for BTP Expert']
      )
      console.log(
        'Critique for SA:' +
          reviewData.overall_feedback['Critique for Solutions Architect']
      )
      const critiqueForSA =
        reviewData.overall_feedback['Critique for Solutions Architect']
      const critiqueForBTP =
        reviewData.overall_feedback['Critique for BTP Expert']

      // Function to check if a string contains "no refinement needed" regardless of case and punctuation
      const noRefinementNeeded = (critique: any) => {
        // This regex looks for "no refinement needed" in a case-insensitive manner and allows an optional full stop at the end
        const regex = /no refinement needed\.?/i
        return regex.test(critique)
      }

      const refinementNeededForSA = !noRefinementNeeded(critiqueForSA)
      const refinementNeededForBTP = !noRefinementNeeded(critiqueForBTP)

      const isRefinementNeededNow =
        refinementNeededForSA || refinementNeededForBTP

      const newRefinementCount = isRefinementNeededNow
        ? refinementCount + 1
        : refinementCount
      setRefinementCount(newRefinementCount)

      // Decide whether to call handleModeration
      if (!isRefinementNeededNow || newRefinementCount > 2) {
        handleModeration()
      }

      // Update the chat with the senior consultant's review
      setMessages((prevMessages) => [
        ...prevMessages.filter(
          (msg) =>
            msg.text !==
            '🧠 Looking through the solutions and gathering feedback ...'
        ),
        {
          sender: 'SAP Senior Consultant',
          text: ` 
          <p>${reviewData.overall_feedback['Personal statement']}</p>
          <br></br>
          <p><strong>Critique for Solutions Architect: </strong>${reviewData.overall_feedback['Critique for Solutions Architect']}</p>
          <br></br>
          <p><strong>Critique for BTP Expert: </strong>${reviewData.overall_feedback['Critique for BTP Expert']}</p>
          `
        }
      ])

      // Check if any refinement is needed
      if (reviewData.needs_refinement) {
        // If critique for Solutions Architect is provided, call the refinement function
        if (reviewData.overall_feedback['Critique for Solutions Architect']) {
          handleSolutionsArchitectRefinement(
            reviewData.overall_feedback['Critique for Solutions Architect']
          )
        }
        // If critique for BTP Expert is provided, call the refinement function
        if (reviewData.overall_feedback['Critique for BTP Expert']) {
          handleBTPExpertRefinement(
            reviewData.overall_feedback['Critique for BTP Expert']
          )
        }
      }
    } catch (error) {
      console.error('Error during senior consultant review: ', error)
      // Update the chat with the error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'Error',
          text: 'An error occurred during the senior consultant review.'
        }
      ])
    }
  }

  // function to handle refinement by Solutions Architect
  const handleSolutionsArchitectRefinement = async (critique: any) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/refine_solutions_architect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            previous_solution: saOutput,
            critique: critique,
            solutions_architect_task:
              SATask /* The original task assigned to the Solutions Architect */
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      // Update the UI with the refined solution
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'SAP Solutions Architect',
          text: formatSolutionsArchitectResponse(
            data.refined_solutions_architect_result
          )
        }
      ])
      console.log(
        'Refined solutions architect result: ' +
          data.refine_solutions_architect_result
      )
    } catch (error) {
      console.error('Error during Solutions Architect refinement:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'Error',
          text: 'An error occurred during the Solutions Architect refinement.'
        }
      ])
    }
  }
  // function to handle refinement by btp expert
  const handleBTPExpertRefinement = async (critique: any) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/refine_btp_expert',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            previous_solution: btpExpertOutput,
            critique: critique,
            btp_expert_task:
              BTPExpertTask /* The original task assigned to the BTP Expert */
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      // Update the UI with the refined solution
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'SAP BTP Expert',
          text: formatSolutionsArchitectResponse(data.refined_btp_expert_result)
        }
      ])
      console.log('Refined BTP expert result: ' + data.refine_btp_expert_result)
    } catch (error) {
      console.error('Error during BTP Expert refinement:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'Error',
          text: 'An error occurred during the BTP Expert refinement.'
        }
      ])
    }
  }

  // function to handle moderation by moderator
  const handleModeration = async () => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/moderate_conversation',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refinement_needed: isRefinementNeeded,
            refinement_count: refinementCount
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      // Add the moderator's message to the chat, if any
      if (data.message) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'Moderator', text: data.message }
        ])
      }

      // Here you can handle whether or not to allow further user input
      // For example, disabling the input field
      if (!data.allow_input) {
        // Disable the input field or take other actions
      }
    } catch (error) {
      console.error('Error during moderation:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'Error', text: 'An error occurred during moderation.' }
      ])
    }
  }

  return (
    <div className='rounded-2xl border h-[75vh] flex flex-col justify-between'>
      <div className='p-6 overflow-auto' ref={containerRef}>
        {SeniorConsultantUI()}

        {messages.map((message, index) => (
          <Card
            key={index}
            className={`mb-2 ${
              message.sender === 'Moderator' ? 'bg-blue-950' : ''
            }`}
          >
            <CardHeader>
              <CardTitle className={determineTitleClass(message.sender)}>
                {message.sender === 'user'
                  ? 'You'
                  : message.sender === 'Moderator'
                  ? '👑 Moderator'
                  : message.sender}
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
