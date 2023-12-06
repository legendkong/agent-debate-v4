'use client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { useRef, useState, useEffect } from 'react'
import { SeniorConsultantUI } from './seniorConsultantUi'
import PdfDownloadButton from './PdfDownload'
import mermaid from 'mermaid'
import {
  newFormatBTPExpertResponse,
  formatSummaryResponse,
  newFormatSolArchitectResponse
} from 'lib/formatResponse'
import { determineTitleClass } from 'lib/determineTitleClass'

type ChatMessage = {
  sender:
    | 'user'
    | 'SAP Lead Consultant'
    | 'SAP Solutions Architect'
    | 'SAP BTP Expert'
    | 'Moderator'
    | 'Summary'
    | 'Error'
  text: string
}

export function Chat() {
  const [input, setInput] = useState('') // State to hold the input value
  const [isLoading, setIsLoading] = useState(false) // State to manage loading state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [btpExpertOutput, setBtpExpertOutput] = useState('')
  const [saOutput, setSaOutput] = useState('')
  const [BTPExpertTask, setBTPExpertTask] = useState('')
  const [SATask, setSATask] = useState('')
  const [isRefinementNeeded, setIsRefinementNeeded] = useState(false)
  const [refinementCount, setRefinementCount] = useState(0)
  const [isSARefinementDone, setIsSARefinementDone] = useState(false)
  const [isBTPExpertRefinementDone, setIsBTPExpertRefinementDone] =
    useState(false)
  const [refinedSolutionsArchitectOutput, setRefinedSolutionsArchitectOutput] =
    useState('')
  const [refinedBTPExpertOutput, setRefinedBTPExpertOutput] = useState('')
  const [moderatorFinished, setModeratorFinished] = useState(false)
  const [isConversationEnded, setIsConversationEnded] = useState(false)
  const [mermaidSvg, setMermaidSvg] = useState('')
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

    // Add a loading message for Lead Consultant
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'SAP Lead Consultant',
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

      setMessages((prevMessages) => [
        ...prevMessages.filter(
          (msg) => msg.text !== '🙋‍♂️🙋‍♀️ Assigning tasks ...'
        ),
        {
          sender: 'SAP Lead Consultant',
          text: `
            <p><strong>Scope:</strong> ${seniorConsultantData.scope}</p>
            <br></br>
            <p><strong>BTP Expert Task:</strong> ${seniorConsultantData.btp_scope}</p>
            <br></br>
            <p><strong>Solutions Architect Task:</strong> ${seniorConsultantData.sa_scope}</p>
          `
        }
      ])

      setBTPExpertTask(seniorConsultantData.btp_expert_task)
      setSATask(seniorConsultantData.solutions_architect_task)

      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => msg.text !== '🙋‍♂️🙋‍♀️ Assigning tasks ...')
      ])

      // ********** Function to handle BTP Expert task independently **********
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
          console.log('BTP EXPERT DATA:' + data.btp_expert_result)
          setBtpExpertOutput(data.btp_expert_result)

          // Remove the loading message and add the actual response
          setMessages((prevMessages) => [
            ...prevMessages.filter(
              (msg) => msg.text !== '⌛️🔃 Searching for information ...'
            ),
            {
              sender: 'SAP BTP Expert',
              text: newFormatBTPExpertResponse(data.btp_expert_result)
              // text: data.btp_expert_result
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
              // text: formatSolutionsArchitectResponse(
              text: newFormatBTPExpertResponse(data.solutions_architect_result)
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

    // Add a loading message for Lead Consultant
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'SAP Lead Consultant',
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
      console.log('Reviewed data by Lead Consultant:' + reviewData)
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

      // Update the chat with the Lead Consultant's review
      setMessages((prevMessages) => [
        ...prevMessages.filter(
          (msg) =>
            msg.text !==
            '🧠 Looking through the solutions and gathering feedback ...'
        ),
        {
          sender: 'SAP Lead Consultant',
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
      console.error('Error during Lead Consultant review: ', error)
      // Update the chat with the error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'Error',
          text: 'An error occurred during the Lead Consultant review.'
        }
      ])
    }
  }

  // function to handle refinement by Solutions Architect
  const handleSolutionsArchitectRefinement = async (critique: any) => {
    // Add a loading message for SAP Solutions Architect
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'SAP Solutions Architect',
        text: '⌛️🔃 Refining the solution ...'
      }
    ])
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
      // Remove the loading message and add the actual response
      setMessages((prevMessages) => [
        ...prevMessages.filter(
          (msg) => msg.text !== '⌛️🔃 Refining the solution ...'
        ),
        {
          sender: 'SAP Solutions Architect',
          // text: formatSolutionsArchitectResponse(
          //   data.refined_solutions_architect_result
          // )
          text: newFormatSolArchitectResponse(
            data.refined_solutions_architect_result
          )
        }
      ])
      console.log(
        'Refined solutions architect result: ' +
          data.refine_solutions_architect_result
      )
      setIsSARefinementDone(true)
      setRefinedSolutionsArchitectOutput(
        data.refined_solutions_architect_result
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
    // Add a loading message for SAP Solutions Architect
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'SAP BTP Expert',
        text: '⌛️🔃 Refining the solution ...'
      }
    ])
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
      // Remove the loading message and add the actual response
      setMessages((prevMessages) => [
        ...prevMessages.filter(
          (msg) => msg.text !== '⌛️🔃 Refining the solution ...'
        ),
        {
          sender: 'SAP BTP Expert',
          // text: formatSolutionsArchitectResponse(data.refined_btp_expert_result)
          text: newFormatSolArchitectResponse(data.refined_btp_expert_result)
        }
      ])
      console.log('Refined BTP expert result: ' + data.refine_btp_expert_result)
      setIsBTPExpertRefinementDone(true)
      setRefinedBTPExpertOutput(data.refined_btp_expert_result)
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
        setModeratorFinished(true)
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

  useEffect(() => {
    if (isSARefinementDone && isBTPExpertRefinementDone) {
      handleReviewBySeniorConsultant()
      // Reset the refinement flags
      setIsSARefinementDone(false)
      setIsBTPExpertRefinementDone(false)
    }
  }, [isSARefinementDone, isBTPExpertRefinementDone])

  // // initialize Mermaid
  // useEffect(() => {
  //   mermaid.initialize({ startOnLoad: true })
  // }, [])

  useEffect(() => {
    const finalSaOutput = refinedSolutionsArchitectOutput || saOutput
    const finalBtpExpertOutput = refinedBTPExpertOutput || btpExpertOutput

    const fetchSummary = async () => {
      // Add a loading message for the Summary
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'Summary',
          text: '✍️ Summarizing the conversation ...'
        }
      ])

      try {
        const response = await fetch('http://localhost:8080/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            solutions_architect_output: finalSaOutput,
            btp_expert_output: finalBtpExpertOutput,
            consulting_question: input
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        const summaryFromConsultant = data.summary

        // Remove the loading message and add the actual response
        setMessages((prevMessages) => [
          ...prevMessages.filter(
            (msg) => msg.text !== '✍️ Summarizing the conversation ...'
          ),
          {
            sender: 'Summary',
            text: formatSummaryResponse(summaryFromConsultant)
          }
        ])
        console.log('Summarized the conversation: ' + summaryFromConsultant)
      } catch (error) {
        console.error('Error fetching summary:', error)
        // Update messages to show error and remove the loading message
        setMessages((prevMessages) => [
          ...prevMessages.filter(
            (msg) => msg.text !== '⌛️🔃 Summarizing the conversation ...'
          ),
          {
            sender: 'Error',
            text: 'An error occurred during the summary generation.'
          }
        ])
      }
    }

    if (moderatorFinished) {
      fetchSummary()
      setModeratorFinished(false) // Reset the state
      setIsConversationEnded(true)
    }
  }, [moderatorFinished])

  useEffect(() => {
    const finalSaOutput = refinedSolutionsArchitectOutput || saOutput

    //fetch mermaid
    const fetchMermaidDiagram = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/convert_to_mermaid',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: finalSaOutput })
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        // Use Mermaid to render the diagram
        console.log('MERMAID SYNTAX:' + data.mermaidSyntax)

        if (data.mermaidSyntax) {
          // Initialize Mermaid
          mermaid.initialize({ startOnLoad: true })

          // Asynchronously render the diagram
          const renderGraph = async () => {
            try {
              const { svg } = await mermaid.render(
                'generatedGraph',
                data.mermaidSyntax
              )
              setMermaidSvg(svg)
              console.log('THIS IS THE SVG' + svg)
            } catch (error) {
              console.error('Mermaid diagram rendering error:', error)
            }
          }

          renderGraph()
        }
      } catch (error) {
        console.error('Error fetching Mermaid diagram:', error)
      }
    }

    if (finalSaOutput) {
      fetchMermaidDiagram()
    }
  }, [saOutput, refinedSolutionsArchitectOutput])

  return (
    <div className='rounded-2xl border h-[75vh] flex flex-col justify-between'>
      <div className='p-6 overflow-auto' ref={containerRef}>
        {SeniorConsultantUI()}

        {messages.map((message, index) => (
          <Card
            key={index}
            className={`mb-2 ${
              message.sender === 'Moderator' ? 'bg-blue-950' : ''
            } ${message.sender === 'Summary' ? 'bg-emerald-950' : ''}`}
          >
            <CardHeader>
              <CardTitle className={determineTitleClass(message.sender)}>
                {message.sender === 'user'
                  ? 'You'
                  : message.sender === 'Moderator'
                  ? '👑 Moderator'
                  : message.sender === 'Summary'
                  ? '📜 Summary'
                  : message.sender}
              </CardTitle>
            </CardHeader>
            <CardContent className='text-sm'>
              {/* Render text or Mermaid diagram based on message sender */}
              {message.sender === 'Summary' ? (
                <>
                  <div dangerouslySetInnerHTML={{ __html: message.text }} />
                  <div
                    dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                    className='my-4'
                  />
                </>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: message.text }} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className=' p-4 flex items-center justify-between'>
        <form onSubmit={handleSubmit} className='flex-grow flex mr-2'>
          <Input
            value={input}
            placeholder={'Type to chat with our professionals from SAP...'}
            onChange={handleInputChange}
            className='flex-grow mr-2'
          />

          <Button type='submit' className='flex-shrink-0'>
            {isLoading ? <Spinner /> : 'Ask'}
          </Button>
        </form>
        <PdfDownloadButton
          messages={messages}
          isConversationEnded={isConversationEnded}
        />
      </div>
    </div>
  )
}
