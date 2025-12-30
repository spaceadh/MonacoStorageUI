"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconFiles,
  IconFolder,
  IconUpload,
  IconShare,
  IconClock,
  IconShield,
} from "@tabler/icons-react";

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const items = [
    {
      title: "My Files",
      description: "Access and manage all your uploaded files",
      header: <Skeleton />,
      icon: <IconFiles className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Folders",
      description: "Organize your files in folders",
      header: <Skeleton />,
      icon: <IconFolder className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Upload",
      description: "Upload new files securely to your storage",
      header: <Skeleton />,
      icon: <IconUpload className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Shared Files",
      description: "View files shared with you and by you",
      header: <Skeleton />,
      icon: <IconShare className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
    {
      title: "Recent Activity",
      description: "Track your recent file operations",
      header: <Skeleton />,
      icon: <IconClock className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Security",
      description: "Luxury-grade protection for your files",
      header: <Skeleton />,
      icon: <IconShield className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-100">
            Welcome back, {user?.userName}!
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Your premium secure file storage dashboard
          </p>
        </div>

        <BentoGrid className="max-w-full mx-0">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-2">Storage Used</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">2.4</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                GB / 100 GB
              </span>
            </div>
            <div className="mt-4 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                style={{ width: "2.4%" }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-2">Total Files</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">127</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                files
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-semibold mb-2">Shared Files</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">12</span>
              <span className="text-neutral-600 dark:text-neutral-400">
                shared
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);
