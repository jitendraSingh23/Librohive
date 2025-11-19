import { auth } from "@/auth";
import { redirect } from "next/navigation";
import RootHeader from "@/components/Root-header";
import Image from "next/image";
import placeholder from "../public/img/onebyone.png";
import { Button } from "@/components/ui/button";
import Statistics from "@/components/StatisticsHome";
import KeyFeatures from "@/components/KeyFeatures";
import { Upload } from "lucide-react";
import { FeaturedAuthors } from "@/components/FeaturedAuthors";
import Footer from "@/components/Footer";
import TrendingBooks from "@/components/TrendingBooks";
import Link from "next/link";
import SignupButton from "@/components/auth/signup-button";

export default async function Home() {
  const session = await auth();

  // If user is logged in, redirect to the protected home page
  if (session?.user) {
    redirect("/home");
  }

  // If not logged in, show the landing page
  return (
    <div className="flex min-h-screen flex-col  ">
      <div className="sticky top-0 z-40">
        <RootHeader />
      </div>
      <section>
        <div className="flex justify-between lg:px-20 md:px-10 sm:px-10  bg-accent-foreground py-20 md:py-52">
          <div className=" relative -top-20 hidden md:flex lg:flex ">
            <Image
              src={placeholder}
              alt="hero"
              className="relative top-0.5 border-4 border-black"
            />
            <Image
              src={placeholder}
              alt="hero"
              className="relative top-20 right-20 border-4 border-black"
            />
            <Image
              src={placeholder}
              alt="hero"
              className="relative top-40 right-120 border-4 border-black"
            />
          </div>
          <div className="flex flex-col gap-6 px-5 ">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-3xl xl:text-6xl/none">
              The Next Generation of Digital Reading
            </h1>
            <p className="max-w-[600px] text-muted-foreground sm:text-xs md:text-lg">
              Write, publish, and read books with a highly interactive and
              personalized experience.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href={"/books"}>
                <Button size="lg">Start Reading</Button>{" "}
              </Link>
              <Link href={"/write"}>
                <Button size="lg" variant="outline">
                  Start Writing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {
        //key statistics
      }
      <section className="flex flex-wrap justify-center bg-muted  gap-6 px-20 py-6 md:py-24 lg:py-32">
        <Statistics title="Total Users" value="1,250" />
        <Statistics title="Total Books" value="2,500" />
        <Statistics title="Total PDFs" value="1,000" />
      </section>
      {
        //key features
      }{" "}
      <section className="flex flex-col  items-center py-6 md:py-12 w-full gap-5 bg-accent-foreground">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Key Features
        </h1>
        <p className=" text-muted-foreground md:text-xl px-6 text-center">
          Everything you need for the ultimate reading and writing experience
        </p>

        <div className="grid  grid-rows-2 gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 xl:grid-cols-3 px-10">
          {[...Array(6)].map((_, i) => (
            <KeyFeatures
              title="PDF Section"
              des="Browse PDFs like Instagram Reels—scrolling to explore different documents."
              Icon={Upload}
              key={i}
            />
          ))}
        </div>
      </section>
      {
        // trending books
      }
      <section className="flex flex-col items-center gap-6 py-6 md:py-12 bg-muted">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Trending Books
        </h1>
        <p className="text-muted-foreground md:text-xl px-6 text-center">
          Discover what others are reading right now
        </p>
        <div className="container px-4 md:px-6">
          <div className="relative mx-auto max-w-5xl py-12">
            <TrendingBooks />
          </div>
        </div>
      </section>
      {
        //trending pdfs
      }
      <section className=" flex flex-col  items-center gap-6 py-6 md:py-12 bg-muted ">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
          Featured Authors
        </h1>
        <p className=" text-muted-foreground md:text-xl px-6 text-center">
          Explore our unique PDF section with a reel-like browsing experience
        </p>
        <div className="container px-4 md:px-6">
          <div className="relative mx-auto max-w-5xl py-6">
            {/* Scroll Container */}
            <div className="mx-auto max-w-5xl ">
              <FeaturedAuthors />
            </div>
          </div>
        </div>
        <div className="flex justify-center py-6">
        <Link href={"/home"}>
       
          <Button variant="outline" size="lg">
            More Authors
          </Button> </Link>
        </div>
      </section>
      <section className="py-12 md:py-24 px-10 overflow-hidden  ">
        <div className="flex container px-4 md:px-6 flex-col gap-20 md:flex-row ">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Your Reading Journey Today
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of readers and writers on the most interactive
                reading platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <SignupButton mode="modal">
                <Button size="lg">Sign up</Button>
              </SignupButton>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
          <div className=" hidden md:flex lg:relative -top-20 -right-50 md:scale-50 lg:scale-100">
            <Image
              src={placeholder}
              alt="hero"
              width={200}
              height={200}
              className="relative top-0.5 border-4 border-black"
            />
            <Image
              src={placeholder}
              alt="hero"
              width={200}
              height={200}
              className="relative top-40 right-10 border-4 border-black"
            />
            <Image
              src={placeholder}
              alt="hero"
              width={200}
              height={200}
              className="relative top-40 right-130 border-4 border-black"
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
