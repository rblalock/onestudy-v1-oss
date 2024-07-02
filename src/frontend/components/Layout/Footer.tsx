export default function Footer() {
  return (
    <footer className="border-t border-b-gray-200 dark:border-gray-800 p-5 dark:text-gray-300 text-black">
      <div className="mx-auto max-w-7xl md:flex md:items-center md:justify-between">
        <div className="">
          <p className="text-center text-xs leading-5">
            &copy; {new Date().getFullYear()} Shopmonkey, Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
