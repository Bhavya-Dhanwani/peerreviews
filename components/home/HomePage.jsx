import HomeHero from "@/components/home/HomeHero";
import HomeLeaderboard from "@/components/home/HomeLeaderboard";
import HomeTaskGrid from "@/components/home/HomeTaskGrid";
import HomeFooterPanel from "@/components/home/HomeFooterPanel";

export default function HomePage({ tasks = [], currentUser = null, leaderboard = [] }) {
  return (
    <>
      <HomeHero currentUser={currentUser} />
      <HomeLeaderboard leaderboard={leaderboard} />
      <HomeTaskGrid tasks={tasks} />
      <HomeFooterPanel taskCount={tasks.length} />
    </>
  );
}
