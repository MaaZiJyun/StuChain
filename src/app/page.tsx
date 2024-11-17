"use client";
import React from "react";
import WithAuth from "./_components/WithAuth";
import API from "./_controllers/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ProtectedPage: React.FC = () => {
  const router = useRouter();
  function handleLogout(e: any): void {
    API().removeAuth();
    window.location.reload();
  }

  const teamMembers = [
    {
      name: "MA ZHI YUAN",
      role: "Project Manager",
      bio: "Alice has over 10 years of experience managing tech projects across various industries.",
    },
    {
      name: "WANG ZE PENG",
      role: "Lead Developer",
      bio: "Bob is a seasoned developer with expertise in full-stack development and system architecture.",
    },
    {
      name: "QIN CAI LING",
      role: "UIUX Designer",
      bio: "Cathy designs user interfaces that provide a seamless user experience.",
    },
    {
      name: "DU JIA HAO",
      role: "Front-end Developer",
      bio: "Cathy designs user interfaces that provide a seamless user experience.",
    },
    {
      name: "XU JUN DA",
      role: "Back-end Developer",
      bio: "Cathy designs user interfaces that provide a seamless user experience.",
    },
  ];

  const features = [
    {
      name: "MA ZHI YUAN",
      info: "Alice has over 10 years of experience managing tech projects across various industries.",
    },
    {
      name: "MA ZHI YUAN",
      info: "Alice has over 10 years of experience managing tech projects across various industries.",
    },
    {
      name: "MA ZHI YUAN",
      info: "Alice has over 10 years of experience managing tech projects across various industries.",
    },
    {
      name: "MA ZHI YUAN",
      info: "Alice has over 10 years of experience managing tech projects across various industries.",
    },
    {
      name: "MA ZHI YUAN",
      info: "Alice has over 10 years of experience managing tech projects across various industries.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 p-4 text-white">
        <nav className="text-center">
          <a href="#" className="mx-8 hover:underline">
            Home
          </a>
          <a href="#features" className="mx-8 hover:underline">
            Features
          </a>
          <a href="#" className="mx-8 hover:underline">
            Pricing
          </a>
          <a href="#team" className="mx-8 hover:underline">
            Team
          </a>
        </nav>
      </header>

      <main className="flex flex-col items-center justify-center bg-white min-h-screen py-12 px-12">
        <section className="text-center py-20 w-1/2">
          <h2 className="text-4xl font-semibold mb-8">
            Blockchain Student Attendance System
          </h2>
          <p className="text-lg mb-10">
            This is a student attendance system developed with Next.js for the
            front end and powered by the Naivecoin blockchain for the back end.
            The system aims to provide secure and reliable student
            authentication.
          </p>

          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </section>

        <section id="features" className="container mx-auto py-20">
          <h3 className="text-3xl font-semibold text-center mb-6">Features</h3>
          <div className="flex justify-around">
            {features.map((feature, index) => (
              <div className="w-full sm:w-1/3 p-4" key={index}>
                <div className="bg-white shadow-md rounded-lg p-6 text-center">
                  <h4 className="font-bold text-lg mb-4">{feature.name}</h4>
                  <p>{feature.info}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="team" className="py-20">
          <h3 className="text-3xl font-semibold text-center mb-8">
            Meet Our Team
          </h3>
          <div className="container mx-auto flex flex-wrap justify-center">
            {teamMembers.map((member, index) => (
              <div className="w-full sm:w-1/2 md:w-1/3 p-4" key={index}>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6 text-center">
                    <h4 className="text-xl font-bold mb-2">{member.name}</h4>
                    <p className="text-gray-600 mb-2">{member.role}</p>
                    <p className="text-gray-700">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>
          &copy; 2024 Blockchain Student Attendance System. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default WithAuth(ProtectedPage);
