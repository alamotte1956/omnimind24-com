# OmniMind24 Frontend Setup Instructions

## 📋 Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Git installed and configured

## 🚀 Quick Setup

### 1. Extract Package
Extract all files from `omnimind24-complete-frontend.tar.gz` to your project directory:
```
C:\Users\alamo\omnimind24-frontend-clean\
```

### 2. Verify Files
After extraction, you should have:
```
omnimind24-frontend-clean/
├── package.json          ✓ Essential
├── vite.config.js        ✓ Essential
├── index.html            ✓ Essential
├── tailwind.config.js    ✓ Essential
├── postcss.config.js     ✓ Essential
├── eslint.config.js      ✓ Essential
├── .gitignore            ✓ Essential
├── .env.example          ✓ Essential
├── README.md
├── SETUP_INSTRUCTIONS.md (this file)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── StripeKeyManager.jsx    ← Security Enhanced
    │   ├── TemplateForm.jsx        ← Performance Optimized
    │   ├── TemplateList.jsx        ← Performance Optimized
    │   └── ... (30+ components)
    ├── pages/
    │   ├── Layout.jsx              ← Accessibility Enhanced
    │   └── ... (15+ pages)
    ├── lib/
    │   ├── sanitizer.js            ← NEW: XSS Protection
    │   ├── errorHandler.js         ← NEW: Enhanced Error Handling
    │   ├── performance.js          ← NEW: Performance Monitoring
    │   └── utils.js
    └── api/
        ├── base44Client.js
        ├── entities.js
        ├── functions.js
        └── integrations.js
```

### 3. Install Dependencies
```cmd
cd C:\Users\alamo\omnimind24-frontend-clean
npm install
```

This will install:
- React 18.2.0
- Vite 5.0.8
- Tailwind CSS 3.3.6
- All security and performance dependencies

### 4. Configure Environment
```cmd
copy .env.example .env
```

Edit `.env` and add your Base44 configuration:
```env
VITE_BASE44_PROJECT_ID=omnimind24-com
VITE_BASE44_API_URL=https://api.base44.com
VITE_API_BASE_URL=https://omnimind24-com.base44.com
```

### 5. Test Build
```cmd
npm run build
```

Expected output:
```
✓ built in 15-30 seconds
✓ dist/index.html
✓ dist/assets/...
```

### 6. Test Development Server (Optional)
```cmd
npm run dev
```

Visit: http://localhost:5173

### 7. Initialize Git (if not already done)
```cmd
git init
git add .
git commit -m "Initial commit: Complete React frontend with security and performance improvements"
```

### 8. Connect to GitHub
```cmd
git remote add origin https://github.com/alamotte1956/omnimind24-frontend.git
git branch -M main
git push -u origin main
```

### 9. Trigger Base44 Deployment
Once pushed to GitHub, Base44 will automatically:
1. Detect the changes
2. Run `npm install`
3. Run `npm run build`
4. Deploy to https://omnimind24-com.base44.com

## 🔧 Troubleshooting

### "package.json not found"
- Ensure you extracted ALL files from the tar.gz
- Check that package.json is in the root directory

### "npm install fails"
- Check Node.js version: `node --version` (should be 18+)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and try again

### "Build fails"
- Check for syntax errors in .env file
- Ensure all dependencies installed: `npm install`
- Check build logs for specific errors

### "Git push fails"
- Verify remote URL: `git remote -v`
- Check GitHub credentials
- Try: `git push -f origin main` (force push)

## 📦 What's Included

### Security Improvements
✅ Enhanced Stripe key management with validation
✅ XSS protection via DOMPurify sanitization
✅ Input validation and sanitization utilities
✅ Secure error handling with message sanitization
✅ Rate limiting for sensitive operations

### Performance Optimizations
✅ Component code splitting (TemplateForm, TemplateList)
✅ Virtual scrolling for large datasets
✅ React.memo, useCallback, useMemo optimizations
✅ Lazy loading and dynamic imports
✅ Performance monitoring utilities

### Accessibility Enhancements
✅ WCAG 2.1 Level AA compliance
✅ ARIA labels and landmarks
✅ Keyboard navigation support
✅ Screen reader optimization
✅ High contrast mode support

## 🎯 Next Steps

1. ✅ Extract package
2. ✅ Install dependencies
3. ✅ Test build
4. ✅ Push to GitHub
5. ⏳ Wait for Base44 auto-deployment
6. ✅ Verify at https://omnimind24.com

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review build logs: `npm run build`
3. Check Base44 deployment logs
4. Verify GitHub repository structure

## 🔐 Security Notes

- Never commit `.env` files
- Keep API keys in environment variables
- Use `.env.example` as template
- Review `.gitignore` before committing

---

**Package Version**: 2.0.0  
**Last Updated**: December 27, 2025  
**Includes**: All security fixes, performance optimizations, and accessibility improvements