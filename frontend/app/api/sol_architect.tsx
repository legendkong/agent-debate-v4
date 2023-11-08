'use client'

import { useEffect, useState } from 'react'

export default function Page() {
  const [result, setResult] = useState('Loading...')

  useEffect(() => {
    const task =
      'I have set up a MS SQL database which captures IoT data from sensors about a coal washery process. We use S/4HANA 2021 which is on-premise. The database contains information about consumed materials and their quantity during the washery process as well as by-products and the coal itself that is produced by it. I want to use this data to confirm our S/4HANA Process Order through an API. I want to have a simple, stable and low cost solution to be setup. I want to know the application architecture, API to be used and the potential BTP services.'

    fetch('http://localhost:8080/api/solutions_architect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ task: task })
    })
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Network response was not ok.')
      })
      .then((data) => {
        // Assuming the response is an object where the keys contain descriptions and the values are "Steps"
        const formattedResult = Object.entries(data)
          .map(([key, value]) => {
            return `${key.trim()}: ${value}\n\n`
          })
          .join('')

        setResult(formattedResult)
      })
      .catch((error) => {
        console.error('Fetch error:', error)
        setResult('Error fetching data')
      })
  }, [])

  return { result }
}
