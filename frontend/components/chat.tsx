'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { useRef, useState, useEffect } from 'react'
import { SeniorConsultantUI } from './seniorConsultantUi'
import PdfDownloadButton from './PdfDownload'
import Image from 'next/image'
import mermaid from 'mermaid'
import {
  newFormatBTPExpertResponse,
  formatSummaryResponse,
  newFormatSolArchitectResponse
} from 'lib/formatResponse'
// import { determineTitleClass } from 'lib/determineTitleClass'
// import { determineProfileImage } from 'lib/determineProfileImage'

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

function determineTitleClass(sender: any) {
  switch (sender) {
    case 'user':
      return 'text-orange-400'
    case 'SAP Lead Consultant':
      return 'text-violet-400'
    case 'SAP Solutions Architect':
      return 'text-blue-300'
    case 'SAP BTP Expert':
      return 'text-green-300'
    case 'Moderator':
      return 'text-amber-200 bg-blue-950'
    case 'Summary':
      return 'text-amber-400 bg-emerald-950'
    case 'Error':
      return 'text-red-300'
    default:
      return ''
  }
}

function determineProfileImage(sender: any) {
  switch (sender) {
    case 'user':
      return (
        <Image
          src='/SAPCustomer.png'
          alt='SAP Customer Profile'
          width={40}
          height={40}
        />
      )
    case 'SAP Lead Consultant':
      return (
        <Image
          src='/SAPLeadConsultant.png'
          alt='SAP Lead Consultant Profile'
          width={40}
          height={40}
        />
      )
    case 'SAP Solutions Architect':
      return (
        <Image
          src='/SAPSolutionsArchitect.png'
          alt='SAP Solutions Architect Profile'
          width={40}
          height={40}
        />
      )
    case 'SAP BTP Expert':
      return (
        <Image
          src='/SAPBTPExpert.png'
          alt='SAP BTP Expert Profile'
          width={40}
          height={40}
        />
      )
    case 'Moderator':
      return (
        <Image
          src='/SAPModerator.png'
          alt='SAP Moderator Profile'
          width={40}
          height={40}
        />
      )
    case 'Summary':
      return (
        <Image
          src='/SAPLeadConsultant.png'
          alt='SAP Moderator Profile'
          width={40}
          height={40}
        />
      )
    case 'Error':
      return (
        <Image
          src='/SAPModerator.png'
          alt='SAP Moderator Profile'
          width={40}
          height={40}
        />
      )
  }
}

export function Chat() {
  const [input, setInput] = useState('') // State to hold the input value
  const [originalQuestion, setOriginalQuestion] = useState('') // State to hold the original question
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
  const [prevCritiqueForSA, setPrevCritiqueForSA] = useState('nil')
  const [prevCritiqueForBTP, setPrevCritiqueForBTP] = useState('nil')
  const [isSubsequentUserInput, setIsSubsequentUserInput] = useState(false)
  const [userQuestion, setUserQuestion] = useState('')
  const [mermaidSvg, setMermaidSvg] = useState('')
  const [mermaidSvgBTP, setMermaidSvgBTP] = useState('')
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
    if (isSubsequentUserInput) {
      await handleV2Moderation(input)
      setIsSubsequentUserInput(false)
    } else {
      // Add user input as a message
      const userInputMessage: ChatMessage = { sender: 'user', text: input }
      setMessages((prevMessages) => [...prevMessages, userInputMessage])
      setOriginalQuestion(input)

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
          ...prevMessages.filter(
            (msg) => msg.text !== '🙋‍♂️🙋‍♀️ Assigning tasks ...'
          )
        ])

        // ********** Function to handle BTP Expert task independently **********
        const handleBTPExpertTask = async (task: any) => {
          // Add a loading message for BTP Expert
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              sender: 'SAP BTP Expert',
              text: '⌛️🔃 Racking my brain ... '
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
            setRefinedBTPExpertOutput(data.btp_expert_result)

            // Remove the loading message and add the actual response
            setMessages((prevMessages) => [
              ...prevMessages.filter(
                (msg) => msg.text !== '⌛️🔃 Racking my brain ... '
              ),
              {
                sender: 'SAP BTP Expert',
                text: newFormatBTPExpertResponse(data.btp_expert_result)
              }
            ])
          } catch (error) {
            console.error('Error from BTP Expert:', error)
            // Update messages to show error and remove the loading message
            setMessages((prevMessages) => [
              ...prevMessages.filter(
                (msg) => msg.text !== `⌛️🔃 Racking my brain ... `
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
            setRefinedSolutionsArchitectOutput(data.solutions_architect_result)

            // Remove the loading message and add the actual response
            setMessages((prevMessages) => [
              ...prevMessages.filter(
                (msg) => msg.text !== '⌛️🔃 Searching for information ...'
              ),
              {
                sender: 'SAP Solutions Architect',
                // text: formatSolutionsArchitectResponse(
                text: newFormatBTPExpertResponse(
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
        // setIsLoading(false)
        setInput('') // Clear input field
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  // Function to handle review by v2SAPSeniorConsultant
  const handleReviewBySeniorConsultant = async () => {
    console.log('In handleReviewBySeniorConsultant function')

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
            solutions_architect_output: saOutput,
            critique_for_sa: prevCritiqueForSA,
            critique_for_btp: prevCritiqueForBTP
          })
        }
      )

      if (!reviewResponse.ok) {
        throw new Error(`HTTP error! Status: ${reviewResponse.status}`)
      }

      const reviewData = await reviewResponse.json()
      const critiqueForSA =
        reviewData.overall_feedback['Critique for Solutions Architect']
      setPrevCritiqueForSA(critiqueForSA)
      const critiqueForBTP =
        reviewData.overall_feedback['Critique for BTP Expert']
      setPrevCritiqueForBTP(critiqueForBTP)

      // Function to check if a string contains "no refinement needed" regardless of case and punctuation
      const noRefinementNeeded = (critique: any) => {
        // This regex looks for "no refinement needed" in a case-insensitive manner and allows an optional full stop at the end
        const regex = /no refinement needed\.?/i
        return regex.test(critique)
      }

      const refinementNeededForSA = !noRefinementNeeded(critiqueForSA)
      const refinementNeededForBTP = !noRefinementNeeded(critiqueForBTP)

      const isRefinementNeededNow =
        refinementNeededForSA && refinementNeededForBTP

      const newRefinementCount = isRefinementNeededNow
        ? refinementCount + 1
        : refinementCount
      setRefinementCount(newRefinementCount)

      // Decide whether to call handleModeration
      if (!isRefinementNeededNow || newRefinementCount > 5) {
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
      setIsLoading(false)
      setIsSubsequentUserInput(true) // Set the flag to indicate that the next user input is a subsequent user input

      // Check if any refinement is needed
      if (reviewData.needs_refinement) {
        // Add the moderator's message to the chat, if any
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'Moderator', text: 'Are there any questions so far?' }
        ])
        setIsSubsequentUserInput(true) // Set the flag to indicate that the next user input is a subsequent user input
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
        text: '⌛️🔃 Refining the solution again ...'
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
          (msg) => msg.text !== '⌛️🔃 Refining the solution again ...'
        ),
        {
          sender: 'SAP Solutions Architect',
          text: newFormatBTPExpertResponse(
            data.refined_solutions_architect_result
          )
        }
      ])
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
        text: '⌛️🔃 Racking my brain again ...'
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
          (msg) => msg.text !== '⌛️🔃 Racking my brain again ...'
        ),
        {
          sender: 'SAP BTP Expert',
          text: newFormatBTPExpertResponse(data.refined_btp_expert_result)
        }
      ])
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

  // Function to interact with v2Moderator API
  const handleV2Moderation = async (userInput: any) => {
    try {
      const response = await fetch('http://localhost:8080/api/v2_moderator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: input })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      console.log('v2 moderator data data: ' + data)
      // console.log('V2 MODERATOR DATA:' + [...data])

      // Add the user's question or statement to the chat
      setMessages((prevMessages: any) => [
        ...prevMessages,
        { sender: 'user', text: input }
      ])
      setInput('') // Clear input field
      console.log('Is question asked? : ' + data.question_asked)

      if (data.question_asked) {
        // If it's a question, handle it (e.g., forward to the lead consultant)
        setUserQuestion(userInput)
        // Add a loading message for Lead Consultant
        await forwardQuestionToLeadConsultant(userInput)
      } else {
        // If not a question, proceed with the refinement process
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            sender: 'SAP Lead Consultant',
            text: 'Alright👍, my team and I will proceed with the tasks.'
          }
        ])
        proceedWithRefinement()
      }
    } catch (error) {
      console.error('Error during v2 moderation:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'Error', text: 'An error occurred during moderation.' }
      ])
    }
  }

  const forwardQuestionToLeadConsultant = async (question: any) => {
    // Add a loading message for Lead Consultant
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: 'SAP Lead Consultant',
        text: '🧠 Processing your question ...'
      }
    ])
    try {
      // Prepare the data to be sent to the backend
      const postData = {
        consulting_question: originalQuestion, // The original consulting question
        btp_expert_output: btpExpertOutput,
        solutions_architect_output: saOutput,
        critique_for_sa: prevCritiqueForSA,
        critique_for_btp: prevCritiqueForBTP,
        user_question: input // The user's follow-up question
      }

      // Make a POST request to the backend
      const response = await fetch(
        'http://localhost:8080/api/v3_senior_consultant',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const reviewData = await response.json()

      // Process the response from the lead consultant
      // Update the chat with the lead consultant's response and any new critiques
      setMessages((prevMessages) => [
        ...prevMessages.filter(
          (msg) => msg.text !== '🧠 Processing your question ...'
        ), // Remove the loading message
        {
          sender: 'SAP Lead Consultant',
          text: reviewData.overall_feedback['Personal statement']
        }
      ])

      // Update critiques for SA and BTP Expert if provided
      if (reviewData.overall_feedback['Critique for Solutions Architect']) {
        setPrevCritiqueForSA(
          reviewData.overall_feedback['Critique for Solutions Architect']
        )
      }
      if (reviewData.overall_feedback['Critique for BTP Expert']) {
        setPrevCritiqueForBTP(
          reviewData.overall_feedback['Critique for BTP Expert']
        )
      }

      // Check if refinement is needed and proceed accordingly
      if (reviewData.needs_refinement) {
        proceedWithRefinement()
      }
    } catch (error) {
      console.error('Error forwarding question to Lead Consultant:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: 'Error',
          text: 'An error occurred while forwarding your question.'
        }
      ])
    }
  }

  const proceedWithRefinement = () => {
    // Implement the logic to initiate the refinement process
    if (prevCritiqueForSA) {
      handleSolutionsArchitectRefinement(prevCritiqueForSA)
    }
    if (prevCritiqueForBTP) {
      handleBTPExpertRefinement(prevCritiqueForBTP)
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

  useEffect(() => {
    const finalSaOutput = refinedSolutionsArchitectOutput
    const finalBtpExpertOutput = refinedBTPExpertOutput

    const fetchSummary = async () => {
      // Add a loading message for the Summary
      console.log('In fetchSummary function')
      console.log('This is the finalSaOutput:' + finalSaOutput)
      console.log('This is the finalBtpExpertOutput:' + finalBtpExpertOutput)
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

      //fetch mermaid for solutions architect
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

      //fetch mermaid for btp expert
      const fetchMermaidDiagramBTP = async () => {
        try {
          const response = await fetch(
            'http://localhost:8080/api/convert_to_mermaid',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text: finalBtpExpertOutput })
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
                setMermaidSvgBTP(svg)
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

      if (finalSaOutput && finalBtpExpertOutput) {
        fetchMermaidDiagram()
        fetchMermaidDiagramBTP()
      }
      setIsConversationEnded(true)
    }
  }, [moderatorFinished])

  // useEffect(() => {
  //   const finalSaOutput = refinedSolutionsArchitectOutput

  //   //fetch mermaid
  //   const fetchMermaidDiagram = async () => {
  //     try {
  //       const response = await fetch(
  //         'http://localhost:8080/api/convert_to_mermaid',
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Content-Type': 'application/json'
  //           },
  //           body: JSON.stringify({ text: finalSaOutput })
  //         }
  //       )

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`)
  //       }

  //       const data = await response.json()

  //       // Use Mermaid to render the diagram
  //       console.log('MERMAID SYNTAX:' + data.mermaidSyntax)

  //       if (data.mermaidSyntax) {
  //         // Initialize Mermaid
  //         mermaid.initialize({ startOnLoad: true })

  //         // Asynchronously render the diagram
  //         const renderGraph = async () => {
  //           try {
  //             const { svg } = await mermaid.render(
  //               'generatedGraph',
  //               data.mermaidSyntax
  //             )
  //             setMermaidSvg(svg)
  //             console.log('THIS IS THE SVG' + svg)
  //           } catch (error) {
  //             console.error('Mermaid diagram rendering error:', error)
  //           }
  //         }

  //         renderGraph()
  //       }
  //     } catch (error) {
  //       console.error('Error fetching Mermaid diagram:', error)
  //     }
  //   }

  //   if (finalSaOutput) {
  //     fetchMermaidDiagram()
  //   }
  // }, [refinedSolutionsArchitectOutput])

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
            <CardHeader className='flex flex-row items-start'>
              {determineProfileImage(message.sender)}
              <CardTitle
                className={`${determineTitleClass(message.sender)} ml-3 pt-2`}
              >
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
                  <p className='text-blue-300 text-sm'>
                    <br></br>
                    <br></br>
                    <strong>
                      SAP Solution Architect&apos;s Mermaid diagram:
                    </strong>
                  </p>
                  <div
                    dangerouslySetInnerHTML={{ __html: mermaidSvg }}
                    className='my-4'
                  />
                  <br></br>
                  <br></br>
                  <p className='text-green-300 text-sm'>
                    <br></br>
                    <br></br>
                    <strong>SAP BTP Expert&apos;s Mermaid diagram:</strong>
                  </p>
                  <div
                    dangerouslySetInnerHTML={{ __html: mermaidSvgBTP }}
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

          <Button type='submit' disabled={isLoading} className='flex-shrink-0'>
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
