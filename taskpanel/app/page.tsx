import TaskPanel from "../components/TaskPanel";

export default function Home() {
  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Welcome to Your Task Panel
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Let's make today productive and stress-free
          </p>
        </div>
        <TaskPanel />
      </div>
    </div>
  );
}
