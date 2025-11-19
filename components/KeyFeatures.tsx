import { LucideIcon } from "lucide-react";

interface featuresprops {
  title: string;
  des: string;
  Icon: LucideIcon;
}

const KeyFeatures: React.FC<featuresprops> = ({ title, des, Icon }) => {
  return (
    <div className=" flex flex-col  *: px-10 py-5 border border-border rounded-lg bg-card justify-center items-center ">
      <div className="flex justify-center items-center rounded-full p-3 bg-primary/10">
        <Icon width={30} height={30} />
      </div>
      <p className=" font-bold tracking-tighter text-2xl text-muted-foreground ">
        {title}
      </p>
      <p className="text-muted-foreground text-center">{des}</p>
      {/* <Image src={iconpath} alt="icon" width={50} height={50}/> */}
    </div>
  );
};

export default KeyFeatures;
