import HomeHero from "@/components/home/HomeHero";
import HomeTaskGrid from "@/components/home/HomeTaskGrid";

export default function HomePage({ tasks = [], currentUser = null }) {
  return (
    <>
      <HomeHero taskCount={tasks.length} currentUser={currentUser} />
      <HomeTaskGrid tasks={tasks} />
    </>
  );
}
