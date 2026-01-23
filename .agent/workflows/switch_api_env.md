---
description: Switch between Local and Live API Environments
---

# Switch API Environment

To switch between the Local (`localhost` / `LAN IP`) and Live (`onrender.com`) API environments, follow these steps:

1. Open the configuration file:
   `d:\Folder Y\Projects\BuckWheat\NIAGA\src\config\env.js`

2. Locate the `CURRENT_ENV` variable.

3. Update its value:

   **For Live (Production):**
   ```javascript
   const CURRENT_ENV = ENV.prod;
   ```

   **For Local (Development):**
   ```javascript
   const CURRENT_ENV = ENV.dev;
   ```
   > Note: Ensure your local server is running if you choose `dev`.
   > For Android, ensure `LOCAL_URL_ANDROID` in the same file matches your machine's IP address.

4. Save the file.

5. Reload your React Native application (e.g., press `r` in the Metro bundler terminal) for the changes to take effect.
