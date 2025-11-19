interface StatisticsProps {
  title: string;
  value: string;
}

const Statistics: React.FC<StatisticsProps> = ({ title, value }) => {
  return (
    <div className=" flex flex-col w-2xs p-10 border border-border rounded-lg bg-card justify-center items-center ">
      <p className=" font-bold tracking-tighter text-2xl text-muted-foreground ">{value}</p>
      <p className="max-w-[600px] text-muted-foreground ">{title}</p>
    </div>
  );
};

export default Statistics;
