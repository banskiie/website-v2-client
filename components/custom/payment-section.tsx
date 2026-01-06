import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, CreditCard, Shield, Smartphone, Zap, MapPin, Mail, Phone } from 'lucide-react';

export default function PaymentSection() {
    const phoneRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.2, rootMargin: '-50px' }
        );

        if (phoneRef.current) {
            observer.observe(phoneRef.current);
        }

        return () => {
            if (phoneRef.current) {
                observer.unobserve(phoneRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="w-full max-w-[1920px] mx-auto">
                <div className="grid lg:grid-cols-5 gap-0 items-stretch h-full">

                    <div className="lg:col-span-4 bg-gradient-to-r from-emerald-50/50 to-white h-full">
                        <div className="p-8 md:p-12 lg:p-16 xl:p-20">
                            <div className="grid lg:grid-cols-2 gap-12 items-center">

                                <div className="space-y-6">
                                    <div
                                        className={`flex w-fit items-center gap-2
    bg-gradient-to-r from-green-600 to-emerald-600 text-white
    px-4 py-2 rounded-full
    mx-auto lg:mx-0
    transform transition-all duration-700 ease-out
    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
  `}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="font-medium text-sm md:text-base lg:text-lg xl:text-lg 2xl:text-lg">C-ONE GOT YOUR BACK!</span>
                                    </div>

                                    <h1 className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-center md:text-center lg:text-left xl:text-left 2xl:text-left text-gray-900 leading-tight transform transition-all duration-800 ease-out delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                                        <span className="text-green-600">Payment Method</span><br />
                                    </h1>

                                    <div className={`bg-white p-4 rounded-xl shadow-sm border border-green-300 mb-10 transform transition-all duration-700 ease-out delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                                        <p className="text-gray-700 font-medium leading-relaxed text-center md:text-left">
                                            <span className="text-green-600">Send your payment</span> anytime, anywhere <span className="text-green-600">with</span>
                                            <span className="inline-flex items-center gap-2 text-yellow-600 font-bold tracking-wider ml-2 align-middle">
                                                <Image
                                                    src="/assets/payment_method/palawanpaylogo.jpg"
                                                    alt="PalawanPay"
                                                    width={28}
                                                    height={28}
                                                    className="rounded-lg"
                                                />
                                                PalawanPay
                                            </span>
                                        </p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="relative">
                                            <div className={`p-4 bg-white rounded-xl border border-green-100 transform transition-all duration-700 ease-out delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'}`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                                                        <Smartphone className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">Pay through Mobile App</h3>
                                                        <p className="text-gray-600">Use the PalawanPay mobile app for instant payments</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`relative my-4 transform transition-all duration-700 ease-out delay-400 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-green-200"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <span className="bg-white px-4 py-1 text-green-600 font-bold text-sm rounded-full border border-green-200">
                                                        OR
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-green-100 transform transition-all duration-700 ease-out delay-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-green-700 flex items-center justify-center flex-shrink-0">
                                                        <MapPin className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1">at any Palawan Branch Near you</h3>
                                                        <p className="text-gray-600">Visit any Palawan Express Pera Padala branch nationwide</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className={`flex items-center gap-2 p-3 bg-white rounded-lg border border-green-100 transform transition-all duration-600 ease-out delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <CreditCard className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Cash & Card Accepted</div>
                                                    <div className="text-xs text-gray-500">Flexible payment options</div>
                                                </div>
                                            </div>

                                            <div className={`flex items-center gap-2 p-3 bg-white rounded-lg border border-green-100 transform transition-all duration-600 ease-out delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                    <Shield className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Secure Transactions</div>
                                                    <div className="text-xs text-gray-500">Guaranteed safety</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`p-5 bg-white rounded-xl border border-green-100 shadow-sm transform transition-all duration-700 ease-out delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                                            <div className="grid grid-rows-2 gap-3">
                                                <div className={`flex items-center gap-2 transform transition-all duration-500 ease-out delay-900 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <Phone className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <span className="text-sm text-gray-700 tracking-wider">0917-705-9132</span>
                                                </div>

                                                <div className={`flex items-center gap-2 transform transition-all duration-500 ease-out delay-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                                                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <Mail className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <span className="text-sm text-gray-700 tracking-wider">inquiry@c-one.ph</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                <div className="relative flex items-center justify-center">
                                    <div
                                        ref={phoneRef}
                                        className={`relative w-full max-w-2xl xl:max-w-3xl 2xl:max-w-4xl transform transition-all duration-1000 ease-out ${isVisible
                                            ? 'translate-y-0 opacity-100'
                                            : 'translate-y-32 opacity-0'
                                            }`}
                                    >
                                        <div className="relative">
                                            <Image
                                                src="/assets/payment_method/palawan_mobile.png"
                                                alt="PalawanPay Mobile App"
                                                width={1200}
                                                height={2400}
                                                className="w-full h-auto max-h-[800px] 2xl:max-h-[900px] object-contain"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 1200px"
                                                priority
                                                style={{
                                                    filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.1))'
                                                }}
                                            />

                                            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-400/5 to-emerald-400/5 blur-xl rounded-full scale-110"></div>
                                        </div>

                                        <div className={`absolute left-7 top-64 -translate-y-1/2 hidden lg:block transform transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100' : 'opacity-0 -translate-x-8'}`}>
                                            <div className="relative w-20 h-20">
                                                <div className="relative w-full h-full">
                                                    <Image
                                                        src="/assets/payment_method/curved_arrow.svg"
                                                        alt="Payment arrow"
                                                        width={80}
                                                        height={80}
                                                        className="w-full h-auto text-green-500"
                                                        style={{
                                                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                                                        }}
                                                    />

                                                    <div className="absolute right-3 top-1/2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>

                                            <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 transform transition-all duration-1000 ease-out delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                                <div className="bg-white text-black px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                                                    <div className="text-xs font-bold tracking-wide">NOW AVAILABLE</div>
                                                </div>

                                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-green-600"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`absolute -bottom-8 -left-8 w-24 h-24 bg-green-400/5 rounded-full blur-xl hidden lg:block transform transition-all duration-1200 ease-out delay-600 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}></div>
                                    <div className={`absolute -top-8 -right-8 w-20 h-20 bg-emerald-400/5 rounded-full blur-xl hidden lg:block transform transition-all duration-1200 ease-out delay-800 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 text-white p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full opacity-10 blur-3xl transform transition-all duration-1500 ease-out delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>
                        <div className={`absolute bottom-0 left-0 w-32 h-32 bg-green-500 rounded-full opacity-10 blur-3xl transform transition-all duration-1500 ease-out delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}></div>

                        <div className="space-y-8 relative z-10">
                            <div className={`text-center lg:text-left transform transition-all duration-800 ease-out delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                                <div className="inline-block">
                                    <h3 className="text-3xl lg:text-4xl font-black leading-tight mb-2">
                                        CREDIT CARDS
                                    </h3>
                                    <h3 className="text-3xl lg:text-4xl font-black leading-tight mb-2 text-emerald-400">
                                        NOW
                                    </h3>
                                    <h3 className="text-3xl lg:text-4xl font-black leading-tight">
                                        ACCEPTED
                                    </h3>
                                    <div className={`h-1 bg-gradient-to-r from-emerald-400 to-green-500 mt-4 rounded-full transform transition-all duration-1000 ease-out delay-300 ${isVisible ? 'scale-x-100' : 'scale-x-0'}`}></div>
                                </div>
                            </div>

                            <div className={`relative flex justify-center lg:justify-start my-12 transform transition-all duration-900 ease-out delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                                <div className="relative w-48 h-32">
                                    <div className={`w-44 h-28 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 rounded-xl shadow-2xl p-4 flex flex-col justify-between transform -rotate-6 absolute top-0 left-0 border border-emerald-400/30 transition-all duration-700 ease-out delay-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="w-8 h-8 bg-yellow-400/20 rounded backdrop-blur-sm"></div>
                                            <div className="flex gap-[-4px]">
                                                <div className="w-7 h-7 rounded-full bg-red-500"></div>
                                                <div className="w-7 h-7 rounded-full bg-yellow-400 -ml-3"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs tracking-wider mb-1">•••• •••• •••• ••••</div>
                                            <div className="text-[10px] font-semibold">MASTERCARD</div>
                                        </div>
                                    </div>

                                    <div className={`w-44 h-28 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-xl shadow-2xl p-4 flex flex-col justify-between absolute top-6 left-8 transform rotate-6 border border-purple-400/30 transition-all duration-700 ease-out delay-600 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-6 opacity-0'}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="w-8 h-8 bg-white/20 rounded backdrop-blur-sm"></div>
                                            <CreditCard className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs tracking-wider mb-1">•••• •••• •••• ••••</div>
                                            <div className="text-[10px] font-semibold">CREDIT CARD</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`text-sm leading-relaxed text-gray-300 bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 transform transition-all duration-800 ease-out delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                                <p>
                                    To better serve you, we are now accepting all major credit cards.
                                    Enjoy a <span className="text-emerald-400 font-semibold">faster</span> and more <span className="text-emerald-400 font-semibold">convenient</span> payment experience.
                                </p>
                            </div>

                            <div className={`mt-6 transform transition-all duration-800 ease-out delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                                <p className="text-emerald-300 text-sm font-medium mb-4 text-center">WE ACCEPT:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className={`h-10 bg-white rounded flex items-center justify-center shadow-sm transform transition-all duration-600 ease-out delay-900 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                                        <span className="text-xs font-bold text-blue-600">VISA</span>
                                    </div>
                                    <div className={`h-10 bg-white rounded flex items-center justify-center shadow-sm transform transition-all duration-600 ease-out delay-1000 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                                        <span className="text-xs font-bold text-blue-400">MASTERCARD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Optional: Add a CTA button with animation if needed */}
                            {/* <div className={`transform transition-all duration-800 ease-out delay-1100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
                                <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 transform hover:-translate-y-1 duration-300">
                                    <CreditCard className="w-5 h-5" />
                                    <span className="font-semibold">Pay with Credit Card</span>
                                </button>
                            </div> */}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}