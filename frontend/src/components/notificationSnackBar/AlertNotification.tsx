export default function AlertNotification({ content }: { content: string }) {
  return <>
    <div className="alert-content text-center font-semibold">
      {content}
    </div>
  </>;
}
