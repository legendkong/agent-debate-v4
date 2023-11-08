// MessageBubble.js
export function MessageBubble({ sender, message }: any) {
  return (
    <div
      className={`message ${
        sender === 'user' ? 'user-message' : 'consultant-message'
      }`}
    >
      <div className='message-content'>{message}</div>
    </div>
  )
}
