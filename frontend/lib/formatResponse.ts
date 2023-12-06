export function newFormatBTPExpertResponse(text: string): string {
  let formattedText = text

  // Handle Markdown-like references ([^x^])
  formattedText = formattedText.replace(
    /\[\^(\d+)\^\]/g,
    '<sup><a href="#ref$1">$1</a></sup>'
  )

  // Convert Markdown links to HTML links (displaying only link text)
  // and make them open in a new tab, with underline and teal color
  formattedText = formattedText.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" style="text-decoration: underline; color: teal;">$1</a>'
  )

  // Handle References section formatted as "1: Reference"
  formattedText = formattedText.replace(
    /References:\s*(\d+:\s*.*?)(?=\s*\d+:|$)/gs,
    function (match, p1) {
      // Split references and format them with numbers and line breaks
      const refs = p1.split(/\s*\d+:\s*/).filter(Boolean)
      return (
        'References:<br />' +
        refs
          .map((ref: any, index: any) => `${index + 1}. ${ref}`)
          .join('<br />')
      )
    }
  )

  // Add line breaks for numbered points
  formattedText = formattedText.replace(/(\d+\.)\s*/g, '<br /><br />$1 ')

  // Add two line breaks before "Reference" and format it in light blue with inline style
  formattedText = formattedText.replace(
    /References/g,
    '<br /><br /><span style="color: lightblue;"><strong>References</strong></span>'
  )

  // Handle numbered references in text
  formattedText = formattedText.replace(
    /\[\^(\d+)\^\]/g,
    '<sup><a href="#ref$1" style="color: blue;">$1</a></sup>'
  )

  // Format bold text (if you have patterns like **text**)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Format italic text (if you have patterns like *text*)
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Additional general formatting rules can be added here

  return formattedText
}

export function formatSummaryResponse(scText: any) {
  return `
      <p style="color: #A78BFA;">SAP Lead Consultant:</p>
      <br>
      <p>${scText}</p>
    `
}

export function newFormatSolArchitectResponse(text: any) {
  let formattedText = text

  // Handle numbered lists
  formattedText = formattedText.replace(/(\d+)\./g, '<br /><br />$1.')

  // Format headers marked with ###Header### into bold
  formattedText = formattedText.replace(/###(.*?)###/g, '<strong>$1</strong>')

  // Format bullet points with indentation
  formattedText = formattedText.replace(
    / - /g,
    '<br /><span style="padding-left: 20px;">&bull; </span>'
  )

  // Format 'Note:'
  formattedText = formattedText.replace(
    /Note:/g,
    '<br /><br /><strong>Note:</strong>'
  )

  return formattedText
}
