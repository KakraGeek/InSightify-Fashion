import React from "react"

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-gray-300">
              © 2025 InSightify - Fashion. All rights reserved | Powered by The Geek Toolbox
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-300">
              Contact: <span className="font-medium text-white">024.429.9095</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
