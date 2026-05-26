#!/usr/bin/env python3
"""
Gamify App Deployment Script
Automates building APK, AAB bundles, and Play Store deployment
"""

import os
import sys
import subprocess
import shutil
import json
import webbrowser
from datetime import datetime
from pathlib import Path

# Configuration
JAVA_HOME = r"C:\Program Files\Microsoft\jdk-17.0.17.10-hotspot"
ANDROID_HOME = r"C:\Users\pc\AppData\Local\Android\Sdk"
PROJECT_ROOT = Path(__file__).parent.parent
ANDROID_DIR = PROJECT_ROOT / "android"
OUTPUT_DIR = PROJECT_ROOT / "builds"
FASTLANE_DIR = PROJECT_ROOT / "fastlane"

# App Info
APP_NAME = "Gamify"
PACKAGE_NAME = "com.anonymous.tenzeries"
PLAY_CONSOLE_URL = "https://play.google.com/console"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_banner():
    """Print app banner"""
    banner = f"""
{Colors.CYAN}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     🎮  GAMIFY - App Deployment Tool  🎮                  ║
║                                                           ║
║     Build • Package • Deploy                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
{Colors.END}
    """
    print(banner)

def print_success(msg):
    print(f"{Colors.GREEN}✓ {msg}{Colors.END}")

def print_error(msg):
    print(f"{Colors.RED}✗ {msg}{Colors.END}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ {msg}{Colors.END}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")

def print_step(step, msg):
    print(f"\n{Colors.CYAN}{Colors.BOLD}[Step {step}]{Colors.END} {msg}")

def check_environment():
    """Check if all required tools are available"""
    print_step(1, "Checking Environment...")
    
    errors = []
    
    # Check Java
    if not os.path.exists(JAVA_HOME):
        errors.append(f"JAVA_HOME not found at: {JAVA_HOME}")
    else:
        print_success(f"Java found: {JAVA_HOME}")
    
    # Check Android SDK
    if not os.path.exists(ANDROID_HOME):
        errors.append(f"ANDROID_HOME not found at: {ANDROID_HOME}")
    else:
        print_success(f"Android SDK found: {ANDROID_HOME}")
    
    # Check Gradle wrapper
    gradlew = ANDROID_DIR / "gradlew.bat"
    if not gradlew.exists():
        errors.append("gradlew.bat not found in android directory")
    else:
        print_success("Gradle wrapper found")
    
    # Check keystore for release builds
    keystore = ANDROID_DIR / "app" / "release.keystore"
    if keystore.exists():
        print_success("Release keystore found")
    else:
        print_warning("Release keystore not found - release builds may fail")
    
    if errors:
        for error in errors:
            print_error(error)
        return False
    
    return True

def setup_environment():
    """Setup environment variables"""
    os.environ["JAVA_HOME"] = JAVA_HOME
    os.environ["ANDROID_HOME"] = ANDROID_HOME
    os.environ["PATH"] = f"{JAVA_HOME}\\bin;{ANDROID_HOME}\\platform-tools;{os.environ['PATH']}"

def run_gradle(task, description):
    """Run a gradle task"""
    print_info(f"Running: {description}...")
    
    gradlew = ANDROID_DIR / "gradlew.bat"
    
    process = subprocess.Popen(
        [str(gradlew), task],
        cwd=str(ANDROID_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Stream output
    for line in process.stdout:
        line = line.strip()
        if line:
            # Highlight important lines
            if "BUILD SUCCESSFUL" in line:
                print_success(line)
            elif "BUILD FAILED" in line or "FAILURE" in line:
                print_error(line)
            elif ">" in line and "task" in line.lower():
                print(f"  {Colors.YELLOW}{line}{Colors.END}")
            else:
                print(f"  {line}")
    
    process.wait()
    return process.returncode == 0

def clean_project():
    """Clean the project"""
    print_step(2, "Cleaning Project...")
    return run_gradle("clean", "Gradle clean")

def build_debug_apk():
    """Build debug APK"""
    print_step(3, "Building Debug APK...")
    
    if run_gradle("assembleDebug", "Debug APK build"):
        apk_path = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
        if apk_path.exists():
            # Copy to builds folder
            OUTPUT_DIR.mkdir(exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            dest = OUTPUT_DIR / f"gamify-debug-{timestamp}.apk"
            shutil.copy(apk_path, dest)
            print_success(f"Debug APK saved to: {dest}")
            print_info(f"APK Size: {apk_path.stat().st_size / (1024*1024):.2f} MB")
            return True
    return False

def build_release_apk():
    """Build release APK"""
    print_step(3, "Building Release APK...")
    
    if run_gradle("assembleRelease", "Release APK build"):
        apk_path = ANDROID_DIR / "app" / "build" / "outputs" / "apk" / "release" / "app-release.apk"
        if apk_path.exists():
            OUTPUT_DIR.mkdir(exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            dest = OUTPUT_DIR / f"gamify-release-{timestamp}.apk"
            shutil.copy(apk_path, dest)
            print_success(f"Release APK saved to: {dest}")
            print_info(f"APK Size: {apk_path.stat().st_size / (1024*1024):.2f} MB")
            return True
    return False

def build_release_bundle():
    """Build release AAB bundle for Play Store"""
    print_step(3, "Building Release Bundle (AAB)...")
    
    if run_gradle("bundleRelease", "Release Bundle build"):
        aab_path = ANDROID_DIR / "app" / "build" / "outputs" / "bundle" / "release" / "app-release.aab"
        if aab_path.exists():
            OUTPUT_DIR.mkdir(exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            dest = OUTPUT_DIR / f"gamify-release-{timestamp}.aab"
            shutil.copy(aab_path, dest)
            print_success(f"Release Bundle saved to: {dest}")
            print_info(f"AAB Size: {aab_path.stat().st_size / (1024*1024):.2f} MB")
            return True
    return False

def show_menu():
    """Show interactive menu"""
    print(f"""
{Colors.BOLD}Select an option:{Colors.END}

  {Colors.CYAN}1{Colors.END}) 🧹 Clean Project
  {Colors.CYAN}2{Colors.END}) 📱 Build Debug APK
  {Colors.CYAN}3{Colors.END}) 🚀 Build Release APK
  {Colors.CYAN}4{Colors.END}) 📦 Build Release Bundle (AAB)
  {Colors.CYAN}5{Colors.END}) ⚡ Full Release Build (Clean + APK + Bundle)
  {Colors.CYAN}6{Colors.END}) 📂 Open Builds Folder
  {Colors.CYAN}---{Colors.END}
  {Colors.MAGENTA}7{Colors.END}) 🏪 {Colors.MAGENTA}Play Store Deployment ➔{Colors.END}
  {Colors.CYAN}---{Colors.END}
  {Colors.CYAN}0{Colors.END}) ❌ Exit

""")

def open_builds_folder():
    """Open builds folder in explorer"""
    OUTPUT_DIR.mkdir(exist_ok=True)
    os.startfile(str(OUTPUT_DIR))
    print_success(f"Opened: {OUTPUT_DIR}")

def get_latest_aab():
    """Get the latest AAB file from builds folder"""
    if not OUTPUT_DIR.exists():
        return None
    aab_files = list(OUTPUT_DIR.glob("*.aab"))
    if not aab_files:
        return None
    return max(aab_files, key=lambda x: x.stat().st_mtime)

def get_latest_apk():
    """Get the latest release APK from builds folder"""
    if not OUTPUT_DIR.exists():
        return None
    apk_files = list(OUTPUT_DIR.glob("*release*.apk"))
    if not apk_files:
        return None
    return max(apk_files, key=lambda x: x.stat().st_mtime)

def check_fastlane():
    """Check if Fastlane is installed"""
    try:
        result = subprocess.run(["fastlane", "--version"], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def setup_fastlane():
    """Setup Fastlane for Play Store deployment"""
    print_step("F", "Setting up Fastlane...")
    
    FASTLANE_DIR.mkdir(exist_ok=True)
    
    # Create Appfile
    appfile = FASTLANE_DIR / "Appfile"
    appfile_content = f'''json_key_file("fastlane/play-store-key.json")
package_name("{PACKAGE_NAME}")
'''
    appfile.write_text(appfile_content)
    print_success("Created Appfile")
    
    # Create Fastfile
    fastfile = FASTLANE_DIR / "Fastfile"
    fastfile_content = '''default_platform(:android)

platform :android do
  desc "Deploy to Play Store Internal Testing"
  lane :internal do
    upload_to_play_store(
      track: 'internal',
      aab: '../builds/' + Dir.glob('../builds/*.aab').max_by {|f| File.mtime(f)}.split('/').last,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  desc "Deploy to Play Store Alpha"
  lane :alpha do
    upload_to_play_store(
      track: 'alpha',
      aab: '../builds/' + Dir.glob('../builds/*.aab').max_by {|f| File.mtime(f)}.split('/').last,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  desc "Deploy to Play Store Beta"
  lane :beta do
    upload_to_play_store(
      track: 'beta',
      aab: '../builds/' + Dir.glob('../builds/*.aab').max_by {|f| File.mtime(f)}.split('/').last,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  desc "Deploy to Play Store Production"
  lane :production do
    upload_to_play_store(
      track: 'production',
      aab: '../builds/' + Dir.glob('../builds/*.aab').max_by {|f| File.mtime(f)}.split('/').last,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end
end
'''
    fastfile.write_text(fastfile_content)
    print_success("Created Fastfile")
    
    print_info("\nFastlane setup complete!")
    print_warning("\nIMPORTANT: You need to add your Play Store API key:")
    print(f"  1. Go to: {Colors.CYAN}https://play.google.com/console{Colors.END}")
    print(f"  2. Settings > API access > Create service account")
    print(f"  3. Download JSON key and save as: {Colors.YELLOW}fastlane/play-store-key.json{Colors.END}")

def show_api_key_guide():
    """Show detailed guide for getting Play Store API key"""
    print(f"""
{Colors.CYAN}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║     🔑 How to Get Play Store API Key (JSON)               ║
╚═══════════════════════════════════════════════════════════╝
{Colors.END}

{Colors.BOLD}{Colors.YELLOW}⚠️ IMPORTANT: Pehle app ko manually Play Store pe upload karna hoga!{Colors.END}
   API key tabhi kaam karega jab app pehle se Play Console mein ho.

{Colors.BOLD}Step 1: Google Cloud Console{Colors.END}
  1. Open: {Colors.CYAN}https://console.cloud.google.com{Colors.END}
  2. Create new project ya existing select karo
  3. Project name: "Gamify" ya kuch bhi

{Colors.BOLD}Step 2: Enable API{Colors.END}
  1. Left menu: "APIs & Services" > "Library"
  2. Search: "Google Play Android Developer API"
  3. Click on it > Click {Colors.GREEN}"ENABLE"{Colors.END}

{Colors.BOLD}Step 3: Create Service Account{Colors.END}
  1. Left menu: "APIs & Services" > "Credentials"
  2. Top pe click: {Colors.GREEN}"+ CREATE CREDENTIALS"{Colors.END}
  3. Select: "Service account"
  4. Fill:
     - Name: "gamify-deploy"
     - ID: auto-fill hoga
  5. Click "CREATE AND CONTINUE"
  6. Role: Skip karo (blank choro)
  7. Click "DONE"

{Colors.BOLD}Step 4: Download JSON Key{Colors.END}
  1. Service account list mein apna account click karo
  2. Top pe "KEYS" tab click karo
  3. Click: {Colors.GREEN}"ADD KEY" > "Create new key"{Colors.END}
  4. Select: {Colors.YELLOW}"JSON"{Colors.END}
  5. Click "CREATE"
  6. {Colors.GREEN}✓ JSON file download ho jayegi!{Colors.END}
  7. Rename karke rakho: {Colors.YELLOW}play-store-key.json{Colors.END}
  8. Copy to: {Colors.YELLOW}{FASTLANE_DIR}/play-store-key.json{Colors.END}

{Colors.BOLD}Step 5: Link to Play Console{Colors.END}
  1. Open: {Colors.CYAN}https://play.google.com/console{Colors.END}
  2. Left menu: "Settings" (gear icon)
  3. Click: "API access"
  4. "Link" your Google Cloud project
  5. Service account show hoga
  6. Click "Grant access" on your service account
  7. Permissions mein select karo:
     - {Colors.GREEN}✓ Admin (all permissions){Colors.END}
     OR
     - ✓ Release to production
     - ✓ Release apps to testing tracks
  8. Click "Invite user" > "Send invite"

{Colors.BOLD}Step 6: Verify{Colors.END}
  Service account email kuch aisa hoga:
  {Colors.CYAN}gamify-deploy@your-project.iam.gserviceaccount.com{Colors.END}

{Colors.RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.END}
{Colors.YELLOW}Alternative: Manual Upload{Colors.END}
  Agar API key nahi banana chahte, toh simply:
  1. Option 4 se AAB build karo
  2. Option 3 se Play Console kholo  
  3. Manually upload karo
{Colors.RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.END}
""")
    
    print(f"\n{Colors.BOLD}Quick Links:{Colors.END}")
    links = [
        ("1", "Google Cloud Console", "https://console.cloud.google.com"),
        ("2", "Play Console", "https://play.google.com/console"),
        ("3", "API Library", "https://console.cloud.google.com/apis/library"),
    ]
    
    for num, name, url in links:
        print(f"  {Colors.CYAN}{num}{Colors.END}) {name}")
    
    choice = input(f"\n{Colors.CYAN}Open link (1-3) or Enter to go back: {Colors.END}").strip()
    
    if choice == "1":
        webbrowser.open("https://console.cloud.google.com")
    elif choice == "2":
        webbrowser.open("https://play.google.com/console")
    elif choice == "3":
        webbrowser.open("https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com")
    
    # Check if key exists
    api_key = FASTLANE_DIR / "play-store-key.json"
    if api_key.exists():
        print_success(f"\n✓ API Key found at: {api_key}")
    else:
        print_warning(f"\n⚠ API Key not found at: {api_key}")
        print_info(f"Download JSON and save it there")

def deploy_with_fastlane(track="internal"):
    """Deploy to Play Store using Fastlane"""
    print_step("D", f"Deploying to Play Store ({track})...")
    
    # Check for AAB
    aab = get_latest_aab()
    if not aab:
        print_error("No AAB file found! Build release bundle first.")
        return False
    
    print_info(f"Using AAB: {aab.name}")
    
    # Check for API key
    api_key = FASTLANE_DIR / "play-store-key.json"
    if not api_key.exists():
        print_error("Play Store API key not found!")
        print_warning(f"Please add: {api_key}")
        return False
    
    # Run Fastlane
    process = subprocess.run(
        ["fastlane", track],
        cwd=str(FASTLANE_DIR),
        capture_output=False
    )
    
    return process.returncode == 0

def manual_play_store_upload():
    """Guide for manual Play Store upload"""
    print(f"""
{Colors.CYAN}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║         📦 Play Store Manual Upload Guide                 ║
╚═══════════════════════════════════════════════════════════╝
{Colors.END}
""")
    
    aab = get_latest_aab()
    
    print(f"{Colors.BOLD}Step 1: Build AAB Bundle{Colors.END}")
    if aab:
        print_success(f"AAB Ready: {aab.name}")
        print_info(f"Size: {aab.stat().st_size / (1024*1024):.2f} MB")
    else:
        print_warning("No AAB found. Select option 4 to build.")
    
    print(f"""
{Colors.BOLD}Step 2: Open Play Console{Colors.END}
  URL: {Colors.CYAN}https://play.google.com/console{Colors.END}

{Colors.BOLD}Step 3: Create/Select App{Colors.END}
  • App Name: {Colors.GREEN}{APP_NAME}{Colors.END}
  • Package: {Colors.GREEN}{PACKAGE_NAME}{Colors.END}

{Colors.BOLD}Step 4: Complete Store Listing{Colors.END}
  Required:
  ☐ Short description (80 chars)
  ☐ Full description (4000 chars)
  ☐ App icon (512x512 PNG)
  ☐ Feature graphic (1024x500 PNG)
  ☐ Screenshots (min 2, max 8)
     • Phone: 16:9 or 9:16
     • 7" Tablet (optional)
     • 10" Tablet (optional)

{Colors.BOLD}Step 5: Content Rating{Colors.END}
  • Complete questionnaire
  • Get IARC rating

{Colors.BOLD}Step 6: Pricing & Distribution{Colors.END}
  • Select countries
  • Set as Free/Paid
  • Accept agreements

{Colors.BOLD}Step 7: Upload AAB{Colors.END}
  • Go to: Production > Create new release
  • Upload: {Colors.YELLOW}{aab.name if aab else 'gamify-release.aab'}{Colors.END}
  • Add release notes
  • Review and rollout

{Colors.BOLD}Step 8: Submit for Review{Colors.END}
  • First review takes 1-3 days
  • Updates usually 1-24 hours
""")
    
    choice = input(f"\n{Colors.CYAN}Open Play Console in browser? (y/n): {Colors.END}").strip().lower()
    if choice == 'y':
        webbrowser.open(PLAY_CONSOLE_URL)
        print_success("Opened Play Console")
    
    if aab:
        choice = input(f"{Colors.CYAN}Open builds folder? (y/n): {Colors.END}").strip().lower()
        if choice == 'y':
            open_builds_folder()

def create_store_listing():
    """Create store listing template"""
    print_step("S", "Creating Store Listing Template...")
    
    store_dir = PROJECT_ROOT / "store_listing"
    store_dir.mkdir(exist_ok=True)
    
    # Create metadata
    metadata = {
        "app_name": APP_NAME,
        "package_name": PACKAGE_NAME,
        "short_description": "🎮 8 addictive mini-games in one app! Play Tenzies, Memory, Tic-Tac-Toe & more!",
        "full_description": """🎮 GAMIFY - Ultimate Mini Games Collection!

Enjoy 8 exciting games in one app:

🎲 TENZIES - Roll dice until all match!
🧠 MEMORY GAME - Match pairs, train your brain!
❌ TIC-TAC-TOE - Classic X and O battle!
🔢 GUESS THE NUMBER - Find the secret number!
🎨 COLOR MATCH - Test your reflexes!
➕ MATH QUIZ - Race against time!
🔨 WHACK-A-MOLE - Tap the moles fast!
⚡ REACTION TEST - Measure your speed!

✨ FEATURES:
• Beautiful dark theme UI
• Smooth animations
• Track your best scores
• Works offline
• No registration needed
• Suitable for all ages

🏆 Challenge yourself and beat your high scores!

Download now and start playing! 🚀""",
        "category": "Games > Casual",
        "content_rating": "Everyone",
        "keywords": [
            "games", "mini games", "puzzle", "tenzies", "memory game",
            "tic tac toe", "brain games", "casual games", "arcade",
            "reaction game", "math quiz", "whack a mole"
        ]
    }
    
    # Save metadata
    metadata_file = store_dir / "metadata.json"
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print_success(f"Created: {metadata_file}")
    
    # Create release notes template
    release_notes = store_dir / "release_notes.txt"
    release_notes.write_text("""🎮 What's New in Gamify v1.0.0:

✨ Initial Release!
• 8 exciting mini-games
• Beautiful dark theme
• High score tracking
• Smooth animations

Enjoy and have fun! 🚀
""", encoding='utf-8')
    print_success(f"Created: {release_notes}")
    
    # Create screenshots folder
    screenshots_dir = store_dir / "screenshots"
    screenshots_dir.mkdir(exist_ok=True)
    
    readme = screenshots_dir / "README.txt"
    readme.write_text("""SCREENSHOT REQUIREMENTS:
========================

Phone Screenshots (Required - min 2, max 8):
- Size: 1080x1920 or 1920x1080 (16:9 aspect)
- Format: PNG or JPEG
- Recommended: Show each game in action

Tablet 7" (Optional):
- Size: 1200x1920 or 1920x1200

Tablet 10" (Optional):
- Size: 1600x2560 or 2560x1600

Feature Graphic (Required):
- Size: 1024x500
- Format: PNG or JPEG
- No text in top/bottom 15%

App Icon (Required):
- Size: 512x512
- Format: PNG (32-bit with alpha)
""", encoding='utf-8')
    
    print_success(f"Created: {screenshots_dir}")
    print_info(f"\nStore listing files saved to: {store_dir}")
    
    choice = input(f"\n{Colors.CYAN}Open store_listing folder? (y/n): {Colors.END}").strip().lower()
    if choice == 'y':
        os.startfile(str(store_dir))

def play_store_menu():
    """Play Store deployment menu"""
    while True:
        print(f"""
{Colors.MAGENTA}{Colors.BOLD}
╔═══════════════════════════════════════════════════════════╗
║            🏪 Play Store Deployment                       ║
╚═══════════════════════════════════════════════════════════╝
{Colors.END}
  {Colors.CYAN}1{Colors.END}) 📖 Manual Upload Guide
  {Colors.CYAN}2{Colors.END}) 📝 Create Store Listing Template
  {Colors.CYAN}3{Colors.END}) 🌐 Open Play Console
  {Colors.CYAN}4{Colors.END}) 📦 Build Release Bundle (AAB)
  {Colors.CYAN}5{Colors.END}) 📂 Open Builds Folder
  {Colors.CYAN}---{Colors.END}
  {Colors.YELLOW}6{Colors.END}) 🔑 {Colors.YELLOW}How to Get API Key (Step-by-Step){Colors.END}
  {Colors.CYAN}7{Colors.END}) ⚙️  Setup Fastlane (Auto Deploy)
  {Colors.CYAN}8{Colors.END}) 🚀 Deploy to Internal Testing
  {Colors.CYAN}9{Colors.END}) 🚀 Deploy to Production
  {Colors.CYAN}---{Colors.END}
  {Colors.CYAN}0{Colors.END}) ⬅️  Back to Main Menu
""")
        
        try:
            choice = input(f"{Colors.BOLD}Enter choice: {Colors.END}").strip()
        except KeyboardInterrupt:
            break
        
        if choice == "0":
            break
        elif choice == "1":
            manual_play_store_upload()
        elif choice == "2":
            create_store_listing()
        elif choice == "3":
            webbrowser.open(PLAY_CONSOLE_URL)
            print_success("Opened Play Console")
        elif choice == "4":
            build_release_bundle()
        elif choice == "5":
            open_builds_folder()
        elif choice == "6":
            show_api_key_guide()
        elif choice == "7":
            setup_fastlane()
        elif choice == "8":
            if check_fastlane():
                deploy_with_fastlane("internal")
            else:
                print_error("Fastlane not installed!")
                print_info("Install with: gem install fastlane")
        elif choice == "9":
            if check_fastlane():
                confirm = input(f"{Colors.RED}Deploy to PRODUCTION? (type 'yes'): {Colors.END}").strip()
                if confirm.lower() == 'yes':
                    deploy_with_fastlane("production")
                else:
                    print_warning("Cancelled")
            else:
                print_error("Fastlane not installed!")
                print_info("Install with: gem install fastlane")
        else:
            print_warning("Invalid choice")
        
        input(f"\n{Colors.CYAN}Press Enter to continue...{Colors.END}")

def full_release_build():
    """Full release build process"""
    print(f"\n{Colors.BOLD}Starting Full Release Build...{Colors.END}\n")
    
    steps_success = []
    
    # Clean
    if clean_project():
        steps_success.append("Clean")
    else:
        print_error("Clean failed!")
        return False
    
    # Release APK
    print("")
    if build_release_apk():
        steps_success.append("Release APK")
    else:
        print_error("Release APK build failed!")
    
    # Release Bundle
    print("")
    if build_release_bundle():
        steps_success.append("Release Bundle")
    else:
        print_error("Release Bundle build failed!")
    
    # Summary
    print(f"\n{Colors.CYAN}{'='*50}{Colors.END}")
    print(f"{Colors.BOLD}Build Summary:{Colors.END}")
    for step in steps_success:
        print_success(step)
    print(f"{Colors.CYAN}{'='*50}{Colors.END}")
    
    return len(steps_success) == 3

def main():
    print_banner()
    
    # Check environment
    if not check_environment():
        print_error("\nEnvironment check failed. Please fix the issues above.")
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    print_success("Environment configured")
    
    while True:
        show_menu()
        
        try:
            choice = input(f"{Colors.BOLD}Enter choice (0-6): {Colors.END}").strip()
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break
        
        if choice == "0":
            print("\nGoodbye! 👋")
            break
        elif choice == "1":
            clean_project()
        elif choice == "2":
            build_debug_apk()
        elif choice == "3":
            build_release_apk()
        elif choice == "4":
            build_release_bundle()
        elif choice == "5":
            full_release_build()
        elif choice == "6":
            open_builds_folder()
        elif choice == "7":
            play_store_menu()
        else:
            print_warning("Invalid choice. Please try again.")
        
        input(f"\n{Colors.CYAN}Press Enter to continue...{Colors.END}")

if __name__ == "__main__":
    main()
