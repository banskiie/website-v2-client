"use client";

import EventsSection from "@/components/custom/event-section";
import Footer from "@/components/custom/footer";
import Header from "@/components/custom/header";
import { CLOUD } from "@/components/custom/main-faq";
import ScrollIndicator from "@/components/custom/scroll-indicator";
import LocationSection from "@/components/custom/sports-center-loc";
import SportsFacts from "@/components/custom/sports-facts";
import FloatingChatWidget from "@/components/custom/ticket";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import { AnimatePresence, m, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Check, Sparkles, X, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@apollo/client/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckEntryModal } from "@/components/custom/category-selection";

const TOURNAMENT_OPTIONS = gql`
  query TournamentOptions {
    tournamentOptions {
      label
      value
      hasEarlyBird
      hasFreeJersey
      ticket
      maxEntriesPerPlayer
      earlyBirdRegistrationEnd
      earlyBirdPaymentEnd
      registrationStart
      registrationEnd
      registrationPaymentEnd
      tournamentStart
      tournamentEnd
    }
  }
`;

const scrollImages = [
  {
    src: `${CLOUD}/v1764048136/sb_icon_ftg2zo.png`,
    alt: "Shuttle Brew Logo",
  },
  {
    src: `${CLOUD}/v1764048167/LOGO-NEW-SPORTSCENTER_BLACK_wewxmw.png`,
    alt: "C-One Sports Center Logo",
  },
  {
    src: `${CLOUD}/v1764048195/courtsidelogo_transparent_black_lkpssv.png`,
    alt: "Courtside Logo",
  },
  {
    src: `${CLOUD}/v1764038540/c-one-logo2_y4elbf.png`,
    alt: "C-One Logo",
  },
];

const infiniteImages = [
  ...scrollImages,
  ...scrollImages,
  ...scrollImages,
  ...scrollImages,
];

interface TournamentOption {
  label: string;
  value: string;
  hasEarlyBird: boolean;
  hasFreeJersey: boolean;
  ticket: string;
  maxEntriesPerPlayer: number;
  earlyBirdRegistrationEnd: string;
  earlyBirdPaymentEnd?: string;
  registrationStart: string;
  registrationEnd: string;
  registrationPaymentEnd: string;
  tournamentStart: string;
  tournamentEnd: string;
}

interface TournamentOptionsResponse {
  tournamentOptions: TournamentOption[];
}

function Page() {
  useSmoothScroll();
  const [_scrolled, setScrolled] = useState(false);
  const [_isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showViewEntriesModal, setShowViewEntriesModal] = useState(false);
  const [showCheckEntryModal, setShowCheckEntryModal] = useState(false)

  const { data, loading, error } = useQuery<TournamentOptionsResponse>(
    TOURNAMENT_OPTIONS,
    {
      fetchPolicy: "network-only",
    },
  );

  const tournamentOptions: TournamentOption[] = data?.tournamentOptions || [];

  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace('#', '');
        const element = document.getElementById(id);

        if (element) {
          element.classList.add('scroll-highlight');

          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });

          setTimeout(() => {
            element.classList.remove('scroll-highlight');
          }, 2000);
        }
      }
    };

    handleHashScroll();

    if (!loading && tournamentOptions.length > 0) {
      setTimeout(handleHashScroll, 100);
    }
  }, [loading, tournamentOptions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight - 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClosePanel = () => {
    setShowPanel(false);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col ">
      <Header />

      <div className="w-full h-screen relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={`${CLOUD}/v1764116059/Background-Badminton_vmiblr.png`}
            alt="Badminton Court"
            fill
            className="object-cover w-full h-full"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center items-start max-w-3xl px-8 md:px-16 text-white space-y-6 z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-bold"
          >
            Welcome to C-One Sports Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-xl leading-relaxed"
          >
            Serve, Smash, and Win! Come and play with your loved ones at the
            largest badminton court in Cagayan de Oro City. With stunning
            surroundings and a large group of players. Table tennis is also
            offered here. Book now at C-ONE Badminton Courts.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <motion.div
              className="bg-green-600 cursor-pointer hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition"
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
              onClick={() =>
                window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
              }
            >
              Explore More
            </motion.div>
          </motion.div>
        </div>


        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10 rounded-full w-12 h-12 flex items-center justify-center"
          initial={{ y: 0, backgroundColor: "#22c55e" }}
          animate={{
            y: [0, -15, 0],
            backgroundColor: ["#22c55e", "#16a34a", "#22c55e"],
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          onClick={() => {
            const tournamentSection = document.getElementById('tournament');
            if (tournamentSection) {
              tournamentSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          }}
        >
          <motion.span
            className="text-white text-2xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓
          </motion.span>
        </motion.div>
      </div>

      <section className="w-full bg-[#F9F9F9] pt-20 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 -top-10 left-0 w-full h-82 z-0 rounded-xl"
          animate={{ x: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        ></motion.div>

        <motion.div
          className="max-w-5xl mx-auto text-center mb-16 px-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            C-One Sports Center
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl text-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Discover our premium Badminton Courts and Ping Pong facilities.
            Perfect for families, friends, and enthusiasts of all levels. Enjoy
            fun, fitness, and friendly competitions in a safe and modern
            environment.
          </motion.p>
        </motion.div>

        <div className="flex flex-col lg:flex-row w-full h-auto lg:h-[80vh] gap-0 lg:gap-1">
          <div className="relative flex-1 min-h-[50vh] lg:min-h-0 min-w-[20%] overflow-hidden cursor-pointer shadow-lg transition-all duration-900 ease-in-out hover:lg:flex-[5]">
            <motion.div
              className="absolute inset-0 overflow-hidden transform hover:scale-105"
              variants={{
                hidden: { opacity: 0, x: -40 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Image
                src={`${CLOUD}/v1764116059/Background-Badminton_vmiblr.png`}
                alt="Badminton Court"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 via-green-800/30 to-transparent"></div>
            </motion.div>

            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white space-y-4 z-10">
              <h3 className="text-md lg:text-2xl md:text-2xl font-semibold">
                Badminton Courts
              </h3>
              <p className="text-sm lg:text-xl md:text-base">
                Play in the largest badminton courts in Cagayan de Oro. Perfect
                for competitive games or casual fun with friends and family.
              </p>
              <Link
                href="/sports-center/courts/badminton-courts/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-white font-medium text-sm rounded-md shadow-md hover:bg-green-800 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                View Courts
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative flex-1 min-h-[50vh] lg:min-h-0 min-w-[20%] overflow-hidden cursor-pointer shadow-lg transition-all duration-900 ease-in-out hover:lg:flex-[5]">
            <motion.div
              className="absolute inset-0 overflow-hidden transform hover:scale-105"
              variants={{
                hidden: { opacity: 0, x: -40 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.6, ease: "easeOut" },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <Image
                src={`${CLOUD}/v1764119987/DSC_0052_ekawpx.png`}
                alt="Ping Pong Court"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-800/40 via-red-700/30 to-transparent"></div>
            </motion.div>

            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white space-y-4 z-10">
              <h3 className="text-md lg:text-2xl md:text-2xl font-semibold">
                Ping Pong Courts
              </h3>
              <p className="text-sm lg:text-xl md:text-base">
                Enjoy exciting table tennis matches in a clean and modern
                setting. Perfect for all ages and skill levels.
              </p>
              <Link
                href="/sports-center/courts/ping-pong-courts/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-800 text-white font-medium text-sm rounded-md shadow-md hover:bg-red-900 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                View Ping Pong
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div
        id="badminton-tournament"
        className="w-full bg-gradient-to-r from-gray-100 via-white to-gray-100 py-2 sm:py-3 md:py-4 relative flex overflow-x-hidden shadow-lg"
      >
        <div className="absolute right-0 top-0 h-full w-20 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-l from-[#F4F3EE] via-[#F4F3EE]/80 to-transparent z-10 backdrop-blur-sm md:backdrop-blur-md" />

        <motion.div
          className="flex items-center gap-8 sm:gap-12 md:gap-16 w-max"
          animate={{ x: ["0%", "-24%"] }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {infiniteImages.map((img, index) => (
            <div
              key={index}
              className="flex-shrink-0 h-16 sm:h-18 md:h-20 w-24 sm:w-32 md:w-40 flex items-center justify-center"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={80}
                height={80}
                className="object-contain w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20"
              />
            </div>
          ))}
        </motion.div>
      </div>

      <div id="tournament" className="w-full bg-linear-to-b from-green-80 to-gray-250 py-20 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 bg-center bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url('${CLOUD}/v1764120057/bg-badminton2_jue7vd.jpg')`,
          }}
        ></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 drop-shadow-sm">
              Badminton Tournaments {new Date().getFullYear()}
            </h2>
            <p className="mt-4 text-lg md:text-xl text-gray-800">
              Join the{" "}
              <span className="font-semibold text-green-700">
                C-ONE Sports Center{" "}
              </span>
              for exciting competitions and a chance to prove your skills on the
              court.
            </p>
            <div className="flex justify-center my-6">
              <div className="border-t-4 border-yellow-300 w-44"></div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : tournamentOptions.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8 md:p-12">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                  <Trophy className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  Ready to Compete?
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                  Choose your action below to register for a tournament, check your entry status, or view verified entries from previous competitions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <Button
                  size="lg"
                  onClick={() => setShowRegisterModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer text-base md:text-md w-full h-auto min-h-[50px] flex items-center justify-center"
                >
                  Register Tournament
                </Button>

                <Button
                  size="lg"
                  onClick={() => setShowCheckEntryModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-2 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer text-base md:text-md w-full h-auto min-h-[50px] flex items-center justify-center"
                >
                  Check Entry
                </Button>

                <Button
                  size="lg"
                  onClick={() => setShowViewEntriesModal(true)}
                  variant="outline"
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-2 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer text-base md:text-md w-full h-auto min-h-[50px] flex items-center justify-center"
                >
                  View Verified Entries
                </Button>
              </div>

              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  {tournamentOptions.length} active tournament
                  {tournamentOptions.length !== 1 ? "s" : ""} available for
                  registration
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Card className="max-w-md mx-auto border-dashed">
                <CardContent className="p-8">
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                    No Active Tournaments
                  </h3>

                  <div className="relative mb-4 group">
                    <p className="text-3xl font-bold text-green-600 animate-pulse mb-2">
                      Coming Soon
                    </p>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-green-300 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-full"></div>
                  </div>

                  <p className="text-gray-600 mb-6">
                    Check back later for upcoming tournaments.
                  </p>
                  <p className="text-gray-600 underline underline-offset-2 font-medium">
                    C-<span className="font-bold text-green-700">ONE</span> Sports Center
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div>
        <SportsFacts />
      </div>

      {/* <div>
        <EventsSection />
      </div> */}

      <div>
        <LocationSection />
      </div>

      <div className="flex flex-col">
        <Footer />
      </div>

      {/* Register Tournament Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg z-10">
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Select Tournament to Register</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRegisterModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Choose from our active tournaments below
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4">
            {tournamentOptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <CalendarIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No Active Tournaments
                </h3>
                <p className="text-sm text-gray-500">
                  Check back later for upcoming tournaments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tournamentOptions.map((tournament) => {
                  const now = new Date();
                  const regStart = new Date(tournament.registrationStart);
                  const regEnd = new Date(tournament.registrationEnd);
                  const isEarlyBirdActive =
                    tournament.hasEarlyBird &&
                    tournament.earlyBirdRegistrationEnd &&
                    now < new Date(tournament.earlyBirdRegistrationEnd);

                  const getRegistrationBadge = () => {
                    if (now < regStart)
                      return {
                        label: "Upcoming",
                        color:
                          "bg-yellow-100 text-yellow-700 border-yellow-200",
                      };
                    if (now > regEnd)
                      return {
                        label: "Closed",
                        color: "bg-gray-100 text-gray-700 border-gray-200",
                      };
                    return {
                      label: "Open",
                      color: "bg-green-100 text-green-700 border-green-200",
                    };
                  };

                  const regBadge = getRegistrationBadge();

                  return (
                    <div
                      key={tournament.value}
                      className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all bg-white"
                    >
                      {/* Header Row - Title and Badges Only */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {tournament.label}
                            </h4>
                            <Badge
                              className={`${regBadge.color} border px-2 py-0.5 text-xs font-medium`}
                            >
                              {regBadge.label}
                            </Badge>
                            {isEarlyBirdActive && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 px-2 py-0.5 text-xs font-medium">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Early Bird
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dates Grid - Compact */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="p-1 bg-green-50 rounded">
                              <Trophy className="w-3.5 h-3.5 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">
                              Tournament
                            </p>
                            <p className="text-xs text-gray-900 truncate">
                              {formatDateShort(tournament.tournamentStart)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="p-1 bg-blue-50 rounded">
                              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">
                              Registration
                            </p>
                            <p className="text-xs text-gray-900 truncate">
                              {formatDateShort(tournament.registrationEnd)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Early Bird - Compact */}
                      {tournament.hasEarlyBird &&
                        tournament.earlyBirdRegistrationEnd && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <div className="p-1 bg-yellow-50 rounded">
                                <Sparkles className="w-3 h-3 text-yellow-600" />
                              </div>
                            </div>
                            <p className="text-xs text-gray-600">
                              <span className="flex flex-col">
                                <span className="font-medium">
                                  Early Bird Payment End:
                                </span>
                                <span className="underline underlin-offset-2 font-medium">
                                  {formatDateShort(
                                    tournament.earlyBirdRegistrationEnd,
                                  )}
                                </span>
                              </span>
                              {isEarlyBirdActive && (
                                <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full">
                                  Active
                                </span>
                              )}
                            </p>
                          </div>
                        )}

                      {/* Features - Compact */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tournament.hasFreeJersey && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded-full border border-purple-200">
                            Free Jersey
                          </span>
                        )}
                        {tournament.ticket && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-700 text-[10px] font-medium rounded-full border border-gray-200">
                            {tournament.ticket}
                          </span>
                        )}
                        {tournament.maxEntriesPerPlayer && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-medium rounded-full border border-orange-200">
                            Max {tournament.maxEntriesPerPlayer}
                          </span>
                        )}
                      </div>

                      {/* Button at Bottom - Full Width */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Link
                          href={`/sports-center/courts/categories/?tournament=${tournament.value}`}
                          onClick={() => setShowRegisterModal(false)}
                          className="block w-full"
                        >
                          <Button
                            size="sm"
                            className={`w-full px-4 py-2 h-9 text-sm font-medium cursor-pointer rounded-full shadow-sm ${now > regEnd
                              ? "bg-gray-100 text-gray-500 cursor-not-allowed hover:bg-gray-100"
                              : now < regStart
                                ? "bg-green-600 hover:bg-green-700 text-white relative overflow-hidden group"
                                : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                            disabled={now > regEnd}
                          >
                            {now > regEnd ? (
                              "Registration Closed"
                            ) : now < regStart ? (
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                <span className="animate-pulse">
                                  Coming Soon
                                </span>
                                <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></span>
                              </span>
                            ) : (
                              "Register Now"
                            )}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 rounded-b-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {tournamentOptions.length} active tournament
                {tournamentOptions.length !== 1 ? "s" : ""}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-600 hover:text-gray-900 h-8 px-3 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Verified Entries Modal */}
      <Dialog
        open={showViewEntriesModal}
        onOpenChange={setShowViewEntriesModal}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg z-10">
            <DialogHeader className="p-0">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>View Verified Entries</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowViewEntriesModal(false)}
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 mt-1">
                Select a tournament to view verified entries
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-4">
            {tournamentOptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  No Tournaments Available
                </h3>
                <p className="text-sm text-gray-500">
                  There are no tournaments to view entries at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tournamentOptions.map((tournament) => {
                  const now = new Date();
                  const tournEnd = new Date(tournament.tournamentEnd);

                  const getTournamentBadge = () => {
                    if (now >= tournEnd)
                      return {
                        label: "Completed",
                        color: "bg-gray-100 text-gray-700 border-gray-200",
                      };
                    return {
                      label: "Ongoing",
                      color: "bg-green-100 text-green-700 border-green-200",
                    };
                  };

                  const tournBadge = getTournamentBadge();

                  return (
                    <div
                      key={tournament.value}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all bg-white"
                    >
                      {/* Header Row - Title and Badges Only */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {tournament.label}
                            </h4>
                            <Badge
                              className={`${tournBadge.color} border px-2 py-0.5 text-xs font-medium`}
                            >
                              {tournBadge.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Dates Grid - Compact */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="p-1 bg-blue-50 rounded">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">
                              Tournament
                            </p>
                            <p className="text-xs text-gray-900 truncate">
                              {formatDateShort(tournament.tournamentStart)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="p-1 bg-purple-50 rounded">
                              <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500">
                              Registration
                            </p>
                            <p className="text-xs text-gray-900 truncate">
                              {formatDateShort(tournament.registrationEnd)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tournament Status - Compact */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-shrink-0">
                          <div
                            className={`p-1 rounded ${tournBadge.label === "Ongoing" ? "bg-green-50" : tournBadge.label === "Upcoming" ? "bg-yellow-50" : "bg-gray-50"}`}
                          >
                            <span className="text-xs">
                              {tournBadge.label === "Ongoing"
                                ? "🏸"
                                : tournBadge.label === "Upcoming"
                                  ? "⏳"
                                  : "✓"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">Status:</span>{" "}
                          {tournBadge.label}
                        </p>
                      </div>

                      {/* Tournament Features - Compact */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tournament.hasFreeJersey && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-medium rounded-full border border-purple-200">
                            Free Jersey
                          </span>
                        )}
                        {tournament.ticket && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-700 text-[10px] font-medium rounded-full border border-gray-200">
                            {tournament.ticket}
                          </span>
                        )}
                      </div>

                      {/* Button at Bottom - Full Width */}
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Link
                          href={`/sports-center/v9-verified/?tournament=${tournament.value}`}
                          onClick={() => setShowViewEntriesModal(false)}
                          className="block w-full"
                        >
                          <Button
                            size="sm"
                            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 h-9 text-sm font-medium rounded-full shadow-sm"
                          >
                            <Users className="w-4 h-4 mr-1.5" />
                            View Verified Entries
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 rounded-b-lg">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                {tournamentOptions.length} tournament
                {tournamentOptions.length !== 1 ? "s" : ""} available
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowViewEntriesModal(false)}
                className="text-gray-600 hover:text-gray-900 h-8 px-3 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CheckEntryModal
        isOpen={showCheckEntryModal}
        onClose={() => setShowCheckEntryModal(false)}
      />
      <ScrollIndicator />
      <FloatingChatWidget />
    </div>
  );
}

export default Page;
