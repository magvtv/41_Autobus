<template>
    <footer class="bg-gray-800 text-white py-8 ">
        <div class="container md:p-8 mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Company Info -->
            <div class="">
                <span class="flex flex-row items-center gap-2 mb-4">
                    <box-icon size="sm" color="white" name='bus'></box-icon>
                    <h2 class="items-center justify-center text-lg text-center font-semibold capitalize">
                        autobus
                    </h2>
                </span>
                <p>
                    Your go-to platform for bus travels across the country.
                </p>
            </div>

            <!-- Navigation Links -->
            <div>
                <h3 class="text-lg font-semibold mb-4 capitalize">
                    about
                </h3>
                <ul>
                    <li class="mb-2">
                        <a href="#" class="hover:underline capitalize">
                            about us
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="#" class="hover:underline capitalize">
                            blogs
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="#" class="hover:underline capitalize">
                            careers
                        </a>
                    </li>
                </ul>
            </div>

            <!-- support links -->
            <div>
                <h3 class="text-lg font-semibold mb-4 capitalize">
                    support
                </h3>
                <ul>
                    <li class="mb-2">
                        <a href="#" class="hover:underline capitalize">
                            contact us
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="#" class="hover:underline">
                            FAQs
                        </a>
                    </li>
                    <li class="mb-2">
                        <a href="#" class="hover:underline capitalize">
                            privacy policy
                        </a>
                    </li>
                </ul>
            </div>

            <!-- Social Media and Contact Info -->
            <div>
                <h3 class="text-lg font-semibold mb-4">Connect with Us</h3>
                <div class="flex items-center space-x-10 mb-4">
                    <a href="#" aria-label="Facebook">
                        <box-icon color="white" size="md" type='logo' name='facebook'></box-icon>
                    </a>
                    <a href="#" aria-label="Twitter">
                        <box-icon color="white" size="md" name='twitter' type='logo' ></box-icon>
                    </a>
                    <a href="#" aria-label="Instagram">
                        <box-icon color="white" size="md" name='instagram' type='logo' ></box-icon>
                    </a>
                    <a href="#" aria-label="Tiktok">
                        <box-icon color="white" size="md" name='tiktok' type='logo' ></box-icon>
                    </a>
                </div>
                <p>Contact us: <a href="mailto:info@mashpoa.com" class="underline">info@autobus.com</a></p>
            </div>
        </div>

        <div class="mt-8 text-center text-sm text-gray-400">
            &copy; 2024 Autobus. All rights reserved.
        </div>
    </footer>
</template>