#!/usr/bin/env python3
"""
Script to integrate credit system and Stripe webhook functions into index.js
This will add the new routes to the main worker file automatically.
"""

import re

def integrate_credit_system():
    print("🔧 Integrating credit system into index.js...")
    
    # Read the current index.js
    with open('index.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Read credit functions
    with open('credit-functions.js', 'r', encoding='utf-8') as f:
        credit_functions = f.read()
    
    # Read Stripe webhook functions
    with open('stripe-webhooks.js', 'r', encoding='utf-8') as f:
        stripe_functions = f.read()
    
    # Extract only the function definitions (remove exports)
    credit_functions = re.sub(r'if \(typeof module.*?\n.*?module\.exports.*?\n.*?\};?\n.*?\}', '', credit_functions, flags=re.DOTALL)
    stripe_functions = re.sub(r'if \(typeof module.*?\n.*?module\.exports.*?\n.*?\};?\n.*?\}', '', stripe_functions, flags=re.DOTALL)
    
    # Find the position to insert functions (before the main export)
    insert_position = content.find('var swisscv_deploy_default = {')
    
    if insert_position == -1:
        print("❌ Could not find insertion point in index.js")
        return False
    
    # Insert the functions
    new_content = (
        content[:insert_position] +
        "\n// ============================================\n" +
        "// CREDIT SYSTEM FUNCTIONS\n" +
        "// ============================================\n" +
        credit_functions + "\n\n" +
        "// ============================================\n" +
        "// STRIPE WEBHOOK FUNCTIONS\n" +
        "// ============================================\n" +
        stripe_functions + "\n\n" +
        content[insert_position:]
    )
    
    # Now add the routes to the fetch handler
    # Find the fetch function
    fetch_pattern = r'async fetch\(request, env\) \{'
    match = re.search(fetch_pattern, new_content)
    
    if not match:
        print("❌ Could not find fetch handler")
        return False
    
    # Find a good place to insert routes (after existing routes, before the final return)
    # Look for the last route definition
    routes_to_add = '''
    // ============================================
    // CREDIT SYSTEM ROUTES
    // ============================================
    
    if (request.method === 'POST' && url.pathname === '/credits/validate') {
      return handleValidateCredits(request, env);
    }
    
    if (request.method === 'POST' && url.pathname === '/credits/consume') {
      return handleConsumeCredits(request, env);
    }
    
    if (request.method === 'GET' && url.pathname === '/credits/balance') {
      return handleGetCreditBalance(request, env);
    }
    
    if (request.method === 'GET' && url.pathname === '/credits/history') {
      return handleGetCreditHistory(request, env);
    }
    
    if (request.method === 'GET' && url.pathname === '/credits/stats') {
      return handleGetCreditStats(request, env);
    }
    
    // ============================================
    // STRIPE WEBHOOK ROUTES
    // ============================================
    
    if (request.method === 'POST' && url.pathname === '/stripe/webhook') {
      return handleStripeWebhook(request, env);
    }
    
    if (request.method === 'POST' && url.pathname === '/stripe/create-checkout') {
      return handleCreateCheckout(request, env);
    }
'''
    
    # Find a safe insertion point - look for the last admin route or similar
    admin_route_pattern = r'(if \(request\.method === "GET" && url\.pathname === "/admin/[^"]+"\) \{[^}]+\}[^}]*\})'
    matches = list(re.finditer(admin_route_pattern, new_content, re.DOTALL))
    
    if matches:
        # Insert after the last admin route
        last_match = matches[-1]
        insert_pos = last_match.end()
        new_content = new_content[:insert_pos] + "\n" + routes_to_add + new_content[insert_pos:]
    else:
        print("⚠️ Could not find admin routes, trying alternative insertion point...")
        # Try to find any route and insert after
        route_pattern = r'(if \(request\.method === "[^"]+" && url\.pathname === "[^"]+"\) \{[^}]+\})'
        matches = list(re.finditer(route_pattern, new_content))
        if matches:
            last_match = matches[-1]
            insert_pos = last_match.end()
            new_content = new_content[:insert_pos] + "\n" + routes_to_add + new_content[insert_pos:]
        else:
            print("❌ Could not find suitable insertion point for routes")
            return False
    
    # Write the modified content
    with open('index.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Successfully integrated credit system into index.js")
    print("📝 Added routes:")
    print("   - POST /credits/validate")
    print("   - POST /credits/consume")
    print("   - GET /credits/balance")
    print("   - GET /credits/history")
    print("   - GET /credits/stats")
    print("   - POST /stripe/webhook")
    print("   - POST /stripe/create-checkout")
    
    return True

if __name__ == '__main__':
    success = integrate_credit_system()
    exit(0 if success else 1)
