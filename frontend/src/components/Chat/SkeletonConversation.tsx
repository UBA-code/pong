import { Skeleton } from "@mui/material";

export default function SkeletonConversation() {
  return (
    <div className="SkeletonConversation p-5 w-full h-full flex flex-col">
      <div className="head flex items-center space-x-2">
        <Skeleton
          className="avatar"
          variant="circular"
          width={70}
          height={70}
        />
        <div className="name-status">
          <Skeleton className="name" width={200} height={40} />
          <Skeleton className="name" width={80} height={20} />
        </div>
      </div>
      <div className="messages my-8 mb-auto">
        <Skeleton className="name" width={100} height={50} />
        <Skeleton className="name ml-auto" width={100} height={50} />
        <Skeleton className="name " width={100} height={50} />
        <Skeleton className="name ml-auto" width={100} height={50} />
        <Skeleton className="name " width={100} height={50} />
      </div>
      <Skeleton className="name w-full " height={100} />
    </div>
  );
}
