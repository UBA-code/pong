import { Skeleton } from "@mui/material";

export default function ConversationInfoSkeleton() {
  return (
    <div className="ConversationInfoSkeleton">
      <div className="head flex items-center space-x-2">
        <Skeleton animation="wave" variant="circular" width={80} height={80} />
        <Skeleton animation="wave" width={200} height={50} />
      </div>
      <div className="actions my-10">
        <Skeleton animation="wave" width={200} height={50} />
        <Skeleton animation="wave" width={200} height={50} />
        <Skeleton animation="wave" width={200} height={50} />
        <Skeleton animation="wave" width={200} height={50} />
      </div>
    </div>
  );
}
