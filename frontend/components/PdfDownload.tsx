// PdfDownloadButton.js
import Image from 'next/image'
import { jsPDF } from 'jspdf'

const PdfDownloadButton = ({ messages, isConversationEnded }: any) => {
  // Helper function to strip HTML tags
  const stripHtml = (html: any) => {
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Generate PDF function
  const generatePDF = () => {
    const doc = new jsPDF()
    let y = 10 // Starting y position

    messages.forEach((msg: any) => {
      const lines = doc.splitTextToSize(stripHtml(msg.text), 180) // Split text into lines
      // Check if adding text will exceed page height
      if (y + 10 * lines.length > 280) {
        doc.addPage() // Add a new page
        y = 10 // Reset y position for the new page
      }
      doc.text(`Sender: ${msg.sender}`, 10, y)
      y += 10 // Increment y coordinate for message text
      doc.text(lines, 10, y)
      y += 10 * lines.length // Increment y based on the number of lines
    })

    // Save the PDF
    doc.save('chat-log.pdf')
  }

  return (
    <button
      onClick={generatePDF}
      disabled={!isConversationEnded}
      style={{
        cursor: !isConversationEnded ? 'not-allowed' : 'pointer',
        opacity: !isConversationEnded ? 0.5 : 1
      }}
      className='ml-1 p-1 radius-2 border-2 rounded-lg border-grey-500'
    >
      <Image
        src='/pdf.png'
        alt='pdf icon'
        width='30'
        height='30'
        style={{
          filter: !isConversationEnded ? 'grayscale(100%)' : 'none'
        }}
      />
    </button>
  )
}

export default PdfDownloadButton
