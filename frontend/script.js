// n8n Terraform Setup Wizard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Step navigation
    const steps = document.querySelectorAll('.step');
    const stepForms = document.querySelectorAll('.step-form');
    const nextButtons = document.querySelectorAll('[id^="next-btn-"]');
    const prevButtons = document.querySelectorAll('[id^="prev-btn-"]');
    const generateBtn = document.getElementById('generate-btn');
    const runTerraformBtn = document.getElementById('run-terraform-btn');
    runTerraformBtn.classList.add('hidden'); // Ensure it's hidden initially
    const useCloudflare = document.getElementById('use-cloudflare');
    const cloudflareSettings = document.getElementById('cloudflare-settings');
    const deployTerminal = document.getElementById('deploy-terminal');
    const sshTerminal = document.getElementById('ssh-terminal');
    const configTerminal = document.getElementById('config-terminal');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressStatus = document.getElementById('progress-status');
    const progressPercentage = document.getElementById('progress-percentage');
    const resultAlert = document.getElementById('result-alert');
    
    // Instance status elements
    const instanceStatusContainer = document.getElementById('instance-status-container');
    const instanceUrlLink = document.getElementById('instance-url-link');
    const instanceIp = document.getElementById('instance-ip');
    const instanceId = document.getElementById('instance-id');
    const sshCommand = document.getElementById('ssh-command');
    const copySshBtn = document.getElementById('copy-ssh-btn');
    const destroyInstanceBtn = document.getElementById('destroy-instance-btn');
    const destroyProgressContainer = document.getElementById('destroy-progress-container');
    const destroyProgressFill = document.getElementById('destroy-progress-fill');
    const destroyProgressStatus = document.getElementById('destroy-progress-status');
    const destroyProgressPercentage = document.getElementById('destroy-progress-percentage');
    const destroyTerminal = document.getElementById('destroy-terminal');
    const backToSetupContainer = document.getElementById('back-to-setup-container');
    const backToSetupBtn = document.getElementById('back-to-setup-btn');
    
    // Modal elements
    const modalOverlay = document.getElementById('confirmation-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    
    // Guide toggles
    const awsGuideToggle = document.getElementById('aws-guide-toggle');
    
    // Initialize SSH terminal with example commands
    addTerminalLine('$ ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_n8n', 'terminal-command', sshTerminal);
    addTerminalLine('Generating public/private rsa key pair.', 'terminal-output', sshTerminal);
    addTerminalLine('Enter passphrase (empty for no passphrase):', 'terminal-output', sshTerminal);
    addTerminalLine('Enter same passphrase again:', 'terminal-output', sshTerminal);
    addTerminalLine('Your identification has been saved in ~/.ssh/id_rsa_n8n', 'terminal-output', sshTerminal);
    addTerminalLine('Your public key has been saved in ~/.ssh/id_rsa_n8n.pub', 'terminal-output', sshTerminal);
    
    // Initialize config terminal with configuration summary
    addTerminalLine('AWS Region: us-east-1', 'terminal-output', configTerminal);
    addTerminalLine('AWS Access Key: AKI*************', 'terminal-output', configTerminal);
    addTerminalLine('AWS Secret Key: *************************', 'terminal-output', configTerminal);
    addTerminalLine('AMI ID: ami-08a6efd148b1f7504', 'terminal-output', configTerminal);
    addTerminalLine('Public Key Path: ~/.ssh/id_rsa.pub', 'terminal-output', configTerminal);
    addTerminalLine('DNS Name: n8n.example.com', 'terminal-output', configTerminal);
    addTerminalLine('Use Cloudflare: true', 'terminal-output', configTerminal);
    addTerminalLine('Cloudflare API Token: *************************', 'terminal-output', configTerminal);
    addTerminalLine('Cloudflare Zone ID: *************************', 'terminal-output', configTerminal);
    const awsGuideContent = document.getElementById('aws-guide-content');
    const cloudflareGuideToggle = document.getElementById('cloudflare-guide-toggle');
    const cloudflareGuideContent = document.getElementById('cloudflare-guide-content');

    // Form fields
    const awsRegion = document.getElementById('aws-region');
    const accessKey = document.getElementById('access-key');
    const secretKey = document.getElementById('secret-key');
    const amiId = document.getElementById('ami-id');
    const publicKeyPath = document.getElementById('public-key-path');
    const dnsName = document.getElementById('dns-name');
    const cloudflareApiToken = document.getElementById('cloudflare-api-token');
    const cloudflareZoneId = document.getElementById('cloudflare-zone-id');

    // Summary fields
    const summaryRegion = document.getElementById('summary-region');
    const summaryAccessKey = document.getElementById('summary-access-key');
    const summarySecretKey = document.getElementById('summary-secret-key');
    const summaryAmiId = document.getElementById('summary-ami-id');
    const summaryPublicKeyPath = document.getElementById('summary-public-key-path');
    const summaryDnsName = document.getElementById('summary-dns-name');
    const summaryUseCloudflare = document.getElementById('summary-use-cloudflare');
    const summaryCloudflareApiToken = document.getElementById('summary-cloudflare-api-token');
    const summaryCloudflareZoneId = document.getElementById('summary-cloudflare-zone-id');

    // Set default values
    publicKeyPath.value = '~/.ssh/id_rsa.pub';
    amiId.value = 'ami-08a6efd148b1f7504';

    // Function to navigate to a specific step
    function goToStep(stepNumber) {
        steps.forEach(step => {
            step.classList.remove('active');
        });
        stepForms.forEach(form => {
            form.classList.remove('active');
        });

        document.getElementById(`step-${stepNumber}`).classList.add('active');
        document.getElementById(`step-form-${stepNumber}`).classList.add('active');
    }

    // Add click event to steps for navigation
    steps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = this.getAttribute('data-step');
            goToStep(stepNumber);
        });
    });

    // Next button event listeners
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.id.split('-')[2]);
            const nextStep = currentStep + 1;
            
            // Validate current step
            if (validateStep(currentStep)) {
                goToStep(nextStep);
            }
        });
    });

    // Previous button event listeners
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(this.id.split('-')[2]);
            const prevStep = currentStep - 1;
            goToStep(prevStep);
        });
    });

    // Toggle Cloudflare settings visibility
    useCloudflare.addEventListener('change', function() {
        cloudflareSettings.style.display = this.checked ? 'block' : 'none';
    });
    
    // Toggle AWS guide visibility
    awsGuideToggle.addEventListener('click', function() {
        const isActive = awsGuideContent.classList.contains('active');
        awsGuideContent.classList.toggle('active');
        
        // Update the toggle icon and text
        if (isActive) {
            this.innerHTML = '<i class="fas fa-chevron-down"></i> Show AWS IAM User Setup Guide';
        } else {
            this.innerHTML = '<i class="fas fa-chevron-up"></i> Hide AWS IAM User Setup Guide';
        }
    });
    
    // Toggle Cloudflare guide visibility
    cloudflareGuideToggle.addEventListener('click', function() {
        const isActive = cloudflareGuideContent.classList.contains('active');
        cloudflareGuideContent.classList.toggle('active');
        
        // Update the toggle icon and text
        if (isActive) {
            this.innerHTML = '<i class="fas fa-chevron-down"></i> Show Cloudflare Setup Guide';
        } else {
            this.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Cloudflare Setup Guide';
        }
    });

    // Validate step before proceeding
    function validateStep(stepNumber) {
        switch(stepNumber) {
            case 1:
                // Prerequisites check - no validation needed
                return true;
            case 2:
                // AWS Credentials validation
                if (!accessKey.value) {
                    alert('Please enter your AWS Access Key.');
                    return false;
                }
                if (!secretKey.value) {
                    alert('Please enter your AWS Secret Key.');
                    return false;
                }
                return true;
            case 3:
                // SSH Key validation
                if (!publicKeyPath.value) {
                    alert('Please enter the path to your SSH public key.');
                    return false;
                }
                return true;
            case 4:
                // Domain & DNS validation
                if (!dnsName.value) {
                    alert('Please enter a DNS name for your n8n instance.');
                    return false;
                }
                if (useCloudflare.checked) {
                    if (!cloudflareApiToken.value) {
                        alert('Please enter your Cloudflare API Token.');
                        return false;
                    }
                    if (!cloudflareZoneId.value) {
                        alert('Please enter your Cloudflare Zone ID.');
                        return false;
                    }
                }
                updateSummary();
                return true;
            default:
                return true;
        }
    }

    // Update summary in the review step
    function updateSummary() {
        // The summary spans are no longer directly updated as content is added to configTerminal
        
        // Clear the config terminal and add the updated configuration
        configTerminal.innerHTML = '';
        addTerminalLine('AWS Region: ' + awsRegion.value, 'terminal-output', configTerminal);
        addTerminalLine('AWS Access Key: ' + maskString(accessKey.value), 'terminal-output', configTerminal);
        addTerminalLine('AWS Secret Key: ' + maskString(secretKey.value), 'terminal-output', configTerminal);
        addTerminalLine('AMI ID: ' + (amiId.value || 'ami-08a6efd148b1f7504'), 'terminal-output', configTerminal);
        addTerminalLine('Public Key Path: ' + publicKeyPath.value, 'terminal-output', configTerminal);
        addTerminalLine('DNS Name: ' + dnsName.value, 'terminal-output', configTerminal);
        addTerminalLine('Use Cloudflare: ' + useCloudflare.checked.toString(), 'terminal-output', configTerminal);
        addTerminalLine('Cloudflare API Token: ' + maskString(cloudflareApiToken.value), 'terminal-output', configTerminal);
        addTerminalLine('Cloudflare Zone ID: ' + maskString(cloudflareZoneId.value), 'terminal-output', configTerminal);
    }

    // Mask sensitive information
    function maskString(str) {
        if (!str) return '';
        if (str.length <= 5) return '*'.repeat(str.length);
        return str.substring(0, 3) + '*'.repeat(str.length - 3);
    }

    // Generate terraform.tfvars file
    generateBtn.addEventListener('click', function() {
        this.disabled = true;
        deployTerminal.classList.remove('hidden');
        progressContainer.classList.remove('hidden');
        resultAlert.classList.add('hidden');
        
        // Clear previous terminal output
        deployTerminal.innerHTML = '';
        
        // Reset progress
        updateProgress(10, 'Starting configuration generation');
        
        // Add initial terminal output
        addTerminalLine('Generating terraform.tfvars file...', 'terminal-command');

        // Create tfvars content
        const tfvarsContent = `# AWS Credentials\n` +
            `access_key = "${accessKey.value}"\n` +
            `secret_key = "${secretKey.value}"\n` +
            `region = "${awsRegion.value}"\n` +
            `ami_id = "${amiId.value || 'ami-08a6efd148b1f7504'}"\n\n` +
            `# SSH Key\n` +
            `public_key_path = "${publicKeyPath.value}"\n\n` +
            `# Cloudflare DNS Configuration\n` +
            `use_cloudflare = ${useCloudflare.checked}\n` +
            `cloudflare_api_token = "${cloudflareApiToken.value}"\n` +
            `cloudflare_zone_id = "${cloudflareZoneId.value}"\n` +
            `dns_name = "${dnsName.value}"\n`;

        // First check if terraform.tfvars already exists
        fetch('http://localhost:5000/api/check-tfvars')
            .then(response => response.json())
            .then(data => {
                if (data.exists) {
                    // Ask for confirmation before overwriting using modal
                    showModalAlert('warning', 'terraform.tfvars already exists. Do you want to overwrite it?', function() {
                        saveTfvarsFile(tfvarsContent, true);
                    });
                    
                    // Set up a cancel handler in the modal function that will re-enable the button
                    const modalCancelBtn = document.getElementById('modal-cancel-btn');
                    modalCancelBtn.addEventListener('click', function cancelHandler() {
                        generateBtn.disabled = false;
                        showAlert('warning', 'Operation cancelled. Existing terraform.tfvars was not modified.');
                        modalCancelBtn.removeEventListener('click', cancelHandler);
                    });
                } else {
                    // No existing file, proceed with saving
                    saveTfvarsFile(tfvarsContent, false);
                }
            })
            .catch(error => {
                console.error('Error checking if terraform.tfvars exists:', error);
                addTerminalLine('Error checking if terraform.tfvars exists. Proceeding with download option.', 'terminal-error');
                
                // Fallback to client-side download if API fails
                provideDownloadOption(tfvarsContent);
            });
    });
    
    // Function to save tfvars file via API
    function saveTfvarsFile(content, overwrite) {
        addTerminalLine('Writing to terraform.tfvars...', 'terminal-output');
        updateProgress(20, 'Writing configuration file');
        
        fetch('http://localhost:5000/api/save-tfvars', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content,
                overwrite: overwrite
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addTerminalLine(`terraform.tfvars saved successfully at: ${data.path}`, 'terminal-success');
                updateProgress(40, 'Configuration file created');
                
                // Disable the generate button
                generateBtn.disabled = true;
                // Reset runTerraformBtn state
                runTerraformBtn.textContent = 'Run Terraform';
                runTerraformBtn.onclick = null; // Remove the onclick handler
                runTerraformBtn.classList.remove('hidden');
                
                // Show success alert
                showAlert('success', 'Configuration file generated successfully! Click "Run Terraform" to initialize and validate your configuration.');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error saving terraform.tfvars:', error);
            addTerminalLine(`Error saving terraform.tfvars: ${error.message}`, 'terminal-error');
            showAlert('danger', 'Failed to save terraform.tfvars. See terminal for details.');
            
            // Fallback to client-side download if API fails
            addTerminalLine('Providing download option instead...', 'terminal-output');
            provideDownloadOption(content);
        });
    }
    
    // Function to provide download option as fallback
    function provideDownloadOption(content) {
        // Create a Blob and download link for the tfvars file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'terraform.tfvars';
        
        addTerminalLine('You can download the file using the link below.', 'terminal-output');
        
        // Add download link to terminal
        const linkLine = document.createElement('div');
        linkLine.className = 'terminal-line';
        linkLine.appendChild(downloadLink);
        downloadLink.textContent = 'Download terraform.tfvars';
        downloadLink.style.color = '#64B5F6';
        downloadLink.style.textDecoration = 'underline';
        downloadLink.style.cursor = 'pointer';
        deployTerminal.appendChild(linkLine);
        
        updateProgress(40, 'Configuration file created');
        
        // Disable the generate button
        generateBtn.disabled = true;
        // Reset runTerraformBtn state
        runTerraformBtn.textContent = 'Run Terraform';
        runTerraformBtn.onclick = null; // Remove the onclick handler
        // Show the run terraform button
        runTerraformBtn.classList.remove('hidden');
        
        // Show success alert with warning about manual file placement
        showAlert('warning', 'Configuration file generated for download. You will need to manually place this file in your Terraform directory.');
        
        // Re-enable the button
        generateBtn.disabled = false;
    }

    // Run Terraform commands
    runTerraformBtn.addEventListener('click', function() {
        this.disabled = true;
        resultAlert.classList.add('hidden');

        if (this.textContent === 'Deploy n8n Instance') {
            // If the button text is 'Deploy n8n Instance', proceed with apply
            showModalAlert('warning', 'This will create REAL AWS resources that WILL INCUR COSTS on your AWS account. Are you sure you want to proceed?', function() {
                runTerraformApply();
            });
        } else {
            // Otherwise, proceed with init/plan
            showModalAlert('warning', 'This will run Terraform commands to prepare your deployment. Continue?', function() {
                runTerraformInit();
            });
        }
        
        // Set up a cancel handler in the modal function that will re-enable the button
        const modalCancelBtn = document.getElementById('modal-cancel-btn');
        modalCancelBtn.addEventListener('click', function cancelHandler() {
            runTerraformBtn.disabled = false;
            modalCancelBtn.removeEventListener('click', cancelHandler);
        });
        
        // Return early as the modal callback will handle continuing
        return;
    });
    
    // Function to run terraform init
    function runTerraformInit() {
        // Terraform init
        addTerminalLine('\nRunning: terraform init', 'terminal-command');
        updateProgress(50, 'Initializing Terraform');
        
        // Call the API to run terraform init
        fetch('http://localhost:5000/api/terraform/init', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            const initCommandId = data.command_id;
            
            // Poll for command status
            const initInterval = setInterval(() => {
                fetch(`http://localhost:5000/api/command/${initCommandId}`)
                    .then(response => response.json())
                    .then(statusData => {
                        // Process any new output
                        if (statusData.output) {
                            // Split output by lines and add each line to terminal
                            const lines = statusData.output.split('\n');
                            for (const line of lines) {
                                if (line.trim()) {
                                    // Check if line already exists in terminal to avoid duplicates
                                    const existingLines = deployTerminal.textContent;
                                    if (!existingLines.includes(line.trim())) {
                                        addTerminalLine(line, 'terminal-output');
                                    }
                            // Construct the n8n URL using the dnsName input
                            const n8nUrl = `http://${dnsName.value}`;

                                }
                            }
                        }
                        
                        // If command is done, move to next step
                        if (statusData.status === 'done') {
                            clearInterval(initInterval);
                            
                            // Check if there was an error
                            if (statusData.output.toLowerCase().includes('error')) {
                                handleTerraformError('init', statusData.output);
                                runTerraformBtn.disabled = false;
                                return;
                            }
                            
                            addTerminalLine('Terraform has been successfully initialized!', 'terminal-success');
                            
                            // Proceed to terraform validate
                            runTerraformValidate();
                        }
                    })
                    .catch(error => {
                        clearInterval(initInterval);
                        console.error('Error checking command status:', error);
                        handleTerraformError('init', error.message);
                        runTerraformBtn.disabled = false;
                    });
            }, 1000); // Poll every second
        })
        .catch(error => {
            console.error('Error running terraform init:', error);
            handleTerraformError('init', error.message);
            runTerraformBtn.disabled = false;
        });
    };
    
    // Function to run terraform validate
    function runTerraformValidate() {
        updateProgress(70, 'Validating configuration');
        addTerminalLine('\nRunning: terraform validate', 'terminal-command');
        
        fetch('http://localhost:5000/api/terraform/validate', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            const validateCommandId = data.command_id;
            
            // Poll for command status
            const validateInterval = setInterval(() => {
                fetch(`http://localhost:5000/api/command/${validateCommandId}`)
                    .then(response => response.json())
                    .then(statusData => {
                        // Process any new output
                        if (statusData.output) {
                            const lines = statusData.output.split('\n');
                            for (const line of lines) {
                                if (line.trim()) {
                                    const existingLines = deployTerminal.textContent;
                                    if (!existingLines.includes(line.trim())) {
                                        addTerminalLine(line, 'terminal-output');
                                    }
                                }
                            }
                        }
                        
                        // If command is done, move to next step
                        if (statusData.status === 'done') {
                            clearInterval(validateInterval);
                            
                            // Check if there was an error
                            if (statusData.output.toLowerCase().includes('error')) {
                                handleTerraformError('validate', statusData.output);
                                runTerraformBtn.disabled = false;
                                return;
                            }
                            
                            addTerminalLine('Success! The configuration is valid.', 'terminal-success');
                            
                            // Proceed to terraform plan
                            runTerraformPlan();
                        }
                    })
                    .catch(error => {
                        clearInterval(validateInterval);
                        console.error('Error checking command status:', error);
                        handleTerraformError('validate', error.message);
                        runTerraformBtn.disabled = false;
                    });
            }, 1000); // Poll every second
        })
        .catch(error => {
            console.error('Error running terraform validate:', error);
            handleTerraformError('validate', error.message);
            runTerraformBtn.disabled = false;
        });
    }
    
    // Function to run terraform plan
    function runTerraformPlan() {
        updateProgress(85, 'Planning deployment');
        addTerminalLine('\nRunning: terraform plan', 'terminal-command');
        
        fetch('http://localhost:5000/api/terraform/plan', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            const planCommandId = data.command_id;
            
            // Poll for command status
            const planInterval = setInterval(() => {
                fetch(`http://localhost:5000/api/command/${planCommandId}`)
                    .then(response => response.json())
                    .then(statusData => {
                        // Process any new output
                        if (statusData.output) {
                            const lines = statusData.output.split('\n');
                            for (const line of lines) {
                                if (line.trim()) {
                                    const existingLines = deployTerminal.textContent;
                                    if (!existingLines.includes(line.trim())) {
                                        addTerminalLine(line, 'terminal-output');
                                    }
                                }
                            }
                        }
                        
                        // If command is done, finish the process
                        if (statusData.status === 'done') {
                            clearInterval(planInterval);
                            
                            // Check if there was an error
                            if (statusData.output.toLowerCase().includes('error')) {
                                handleTerraformError('plan', statusData.output);
                                runTerraformBtn.disabled = false;
                                return;
                            }
                            
                            updateProgress(100, 'Ready to deploy');
                            
                            // Add information about AWS costs and what terraform apply does
                            addTerminalLine('\nINFORMATION ABOUT TERRAFORM APPLY:', 'terminal-output');
                            addTerminalLine('Running terraform apply will create the following resources in your AWS account:', 'terminal-output');
                            addTerminalLine('- EC2 instance for n8n', 'terminal-output');
                            addTerminalLine('- Security groups', 'terminal-output');
                            addTerminalLine('- DNS records (if using Cloudflare)', 'terminal-output');
                            
                            // Add cost information
                            addTerminalLine('\nCOST INFORMATION:', 'terminal-output');
                            addTerminalLine('- If you have just created your AWS account, you are eligible for the AWS Free Tier and will be charged nothing for this setup.', 'terminal-output');
                            addTerminalLine('- If you are not Free Tier eligible, this setup will cost approximately $8.50 per month.', 'terminal-output');
                            
                            // Change the text of the run terraform button
                            runTerraformBtn.textContent = 'Deploy n8n Instance';
                            // Re-enable the run terraform button
                            runTerraformBtn.disabled = false;
                            // Note: The main event listener already handles the 'Deploy n8n Instance' case
                            
                            showAlert('success', 'Configuration validated successfully! You can now deploy your n8n instance. WARNING: This will create real AWS resources that may incur costs.');
                        }
                    })
                    .catch(error => {
                        clearInterval(planInterval);
                        console.error('Error checking command status:', error);
                        handleTerraformError('plan', error.message);
                        runTerraformBtn.disabled = false;
                    });
            }, 1000); // Poll every second
        })
        .catch(error => {
            console.error('Error running terraform plan:', error);
            handleTerraformError('plan', error.message);
            runTerraformBtn.disabled = false;
        });
    }
    
    // Function to show modal confirmation - deprecated, use showModalAlert instead
    function showConfirmationModal(title, content, confirmCallback) {
        // Use the new showModalAlert function instead
        const modalOverlay = document.getElementById('confirmation-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        
        // Set title and content
        modalTitle.textContent = title;
        modalTitle.previousElementSibling.className = 'fas fa-exclamation-triangle';
        modalContent.innerHTML = content;
        
        // Show the modal with confirmation callback
        showModalAlert('warning', content, confirmCallback);
    }
    
    // Function to run terraform apply
    function runTerraformApply() {
        // Show a strong warning about costs using modal
        const costWarningContent = `
            <p><strong>This will create REAL AWS resources on your AWS account.</strong></p>
            <p>This deployment will be FREE if your AWS account is new (Free Tier eligible). If not, it will cost you approximately $8.50/month.</p>
            <p>Resources to be created:</p>
            <ul>
                <li>EC2 instance (t3.micro)</li>
                <li>Security groups</li>
                <li>DNS records (if using Cloudflare)</li>
            </ul>
            <p>Are you sure you want to proceed?</p>
        `;
        
        showConfirmationModal('WARNING: AWS Resources Will Be Created', costWarningContent, function() {
            // Disable the apply button
            runTerraformBtn.disabled = true;
            
            updateProgress(0, 'Starting deployment');
            addTerminalLine('\nRunning: terraform apply -auto-approve', 'terminal-command');
            
            fetch('http://localhost:5000/api/terraform/apply', {
                method: 'POST'
            })
            .then(response => response.json())
            .then(data => {
                const applyCommandId = data.command_id;
                
                // Poll for command status
                const applyInterval = setInterval(() => {
                    fetch(`http://localhost:5000/api/command/${applyCommandId}`)
                        .then(response => response.json())
                        .then(statusData => {
                            // Process any new output
                            if (statusData.output) {
                                const lines = statusData.output.split('\n');
                                for (const line of lines) {
                                    if (line.trim()) {
                                        const existingLines = deployTerminal.textContent;
                                        if (!existingLines.includes(line.trim())) {
                                            addTerminalLine(line, 'terminal-output');
                                            
                                            // Update progress based on output
                                            if (line.includes('Creating...')) {
                                                updateProgress(30, 'Creating resources');
                                            } else if (line.includes('Creation complete')) {
                                                updateProgress(60, 'Resources created');
                                            } else if (line.includes('Apply complete')) {
                                                updateProgress(90, 'Deployment complete');
                                            }
                                        }
                                    }
                                }
                            }
                            
                            // If command is done, finish the process
                            if (statusData.status === 'done') {
                                clearInterval(applyInterval);
                                
                                // Check if there was an error
                                if (statusData.output.toLowerCase().includes('error')) {
                                    handleTerraformError('apply', statusData.output);
                                    runTerraformBtn.disabled = false;
                                    return;
                                }
                            
                            updateProgress(100, 'Deployment complete');
                            
                            // Construct the n8n URL using the dnsName input
                            const n8nUrl = `http://${dnsName.value}`;
                            
                            if (n8nUrl) {
                                addTerminalLine(`\nSUCCESS! Your n8n instance has been deployed!`, 'terminal-success');
                                addTerminalLine(`\nYour n8n instance will be available at: ${n8nUrl}`, 'terminal-success');
                                addTerminalLine('\nIMPORTANT: The instance will be up and running correctly after 2-3 minutes.', 'terminal-warning');
                                
                                // Create a prominent link box
                                const linkBox = document.createElement('div');
                                linkBox.style.margin = '15px 0';
                                linkBox.style.padding = '15px';
                                linkBox.style.backgroundColor = '#2d2d2d';
                                linkBox.style.borderRadius = '8px';
                                linkBox.style.textAlign = 'center';
                                
                                const linkTitle = document.createElement('div');
                                linkTitle.textContent = 'Your n8n Instance:';
                                linkTitle.style.marginBottom = '10px';
                                linkTitle.style.color = '#ffffff';
                                linkTitle.style.fontWeight = 'bold';
                                
                                const link = document.createElement('a');
                                link.href = n8nUrl;
                                link.target = '_blank';
                                link.textContent = n8nUrl;
                                link.style.color = '#64B5F6';
                                link.style.textDecoration = 'underline';
                                link.style.cursor = 'pointer';
                                link.style.fontSize = '16px';
                                link.style.fontWeight = 'bold';
                                
                                const linkNote = document.createElement('div');
                                linkNote.textContent = 'Click to open (available in 2-3 minutes)';
                                linkNote.style.marginTop = '10px';
                                linkNote.style.color = '#aaaaaa';
                                linkNote.style.fontSize = '12px';
                                
                                linkBox.appendChild(linkTitle);
                                linkBox.appendChild(link);
                                linkBox.appendChild(linkNote);
                                deployTerminal.appendChild(linkBox);
                            } else {
                                addTerminalLine('\nDeployment complete! Your n8n instance has been deployed.', 'terminal-success');
                                addTerminalLine('Check the AWS console for details on how to access your instance.', 'terminal-output');
                                addTerminalLine('\nIMPORTANT: The instance will be up and running correctly after 2-3 minutes.', 'terminal-warning');
                            }
                            
                            // Show success modal with redirect to instance status
                            showModalAlert('success', 'n8n has been successfully deployed to AWS! Redirecting to instance status...', function() {
                                // Redirect to instance status view after clicking OK
                                setTimeout(function() {
                                    checkTerraformStatus();
                                }, 500);
                            });
                            runTerraformBtn.disabled = true; // Disable the button after successful deployment
                        }
                    })
                    .catch(error => {
                        clearInterval(applyInterval);
                        console.error('Error checking command status:', error);
                        handleTerraformError('apply', error.message);
                        runTerraformBtn.disabled = false;
                    });
            }, 1000); // Poll every second
        })
        .catch(error => {
            console.error('Error running terraform apply:', error);
            handleTerraformError('apply', error.message);
            runTerraformBtn.disabled = false;
        });
        }); // Close the showConfirmationModal callback
    }

    // Add a line to the terminal
    function addTerminalLine(text, className, targetTerminal = deployTerminal) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const content = document.createElement('span');
        content.className = className;
        content.textContent = text;
        
        // Handle long lines by adding word-break opportunities
        if (text && text.length > 80) {
            content.style.wordBreak = 'break-all';
            content.style.overflowWrap = 'break-word';
            content.style.whiteSpace = 'pre-wrap';
            
            // For very long lines without spaces, add soft hyphens every 40 characters
            // to provide additional break opportunities
            if (text.length > 120 && !text.includes(' ')) {
                let formattedText = '';
                for (let i = 0; i < text.length; i++) {
                    formattedText += text[i];
                    if (i > 0 && i % 40 === 0) {
                        formattedText += '\u00AD'; // Soft hyphen character
                    }
                }
                content.textContent = formattedText;
            }
        }
        
        line.appendChild(content);
        targetTerminal.appendChild(line);
        targetTerminal.scrollTop = targetTerminal.scrollHeight;
    }

    // Update progress bar
    function updateProgress(percentage, status) {
        progressFill.style.width = `${percentage}%`;
        progressStatus.textContent = status;
        progressPercentage.textContent = `${percentage}%`;
    }

    // Show alert message
    function showAlert(type, message) {
        // For warnings, add them to the terminal instead of showing an alert
        if (type === 'warning') {
            addTerminalLine(`\nWARNING: ${message}`, 'terminal-warning');
            return;
        }
        
        // Show modal alert instead of inline alert
        showModalAlert(type, message);
        
        // Also update the inline alert for reference
        resultAlert.className = `alert alert-${type}`;
        resultAlert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
        resultAlert.classList.remove('hidden');
    }
    
    // Show modal alert
    function showModalAlert(type, message, onConfirm = null) {
        const modalOverlay = document.getElementById('confirmation-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const modalCancelBtn = document.getElementById('modal-cancel-btn');
        const modalConfirmBtn = document.getElementById('modal-confirm-btn');
        
        // Set title based on alert type
        let title = 'Information';
        let icon = 'info-circle';
        
        if (type === 'success') {
            title = 'Success';
            icon = 'check-circle';
        } else if (type === 'danger') {
            title = 'Error';
            icon = 'exclamation-circle';
        } else if (type === 'warning') {
            title = 'Warning';
            icon = 'exclamation-triangle';
        }
        
        // Update modal content
        modalTitle.textContent = title;
        modalTitle.previousElementSibling.className = `fas fa-${icon}`;
        modalContent.innerHTML = message;
        
        // Show/hide buttons based on whether confirmation is needed
        if (onConfirm) {
            modalCancelBtn.style.display = 'block';
            modalConfirmBtn.textContent = 'Confirm';
            
            // Set up event listeners
            const confirmHandler = () => {
                modalOverlay.classList.remove('active');
                onConfirm();
                modalConfirmBtn.removeEventListener('click', confirmHandler);
            };
            
            const cancelHandler = () => {
                modalOverlay.classList.remove('active');
                modalCancelBtn.removeEventListener('click', cancelHandler);
                modalConfirmBtn.removeEventListener('click', confirmHandler);
            };
            
            modalConfirmBtn.addEventListener('click', confirmHandler);
            modalCancelBtn.addEventListener('click', cancelHandler);
        } else {
            modalCancelBtn.style.display = 'none';
            modalConfirmBtn.textContent = 'OK';
            
            // Set up event listener for OK button
            const okHandler = () => {
                modalOverlay.classList.remove('active');
                modalConfirmBtn.removeEventListener('click', okHandler);
            };
            
            modalConfirmBtn.addEventListener('click', okHandler);
        }
        
        // Show the modal
        modalOverlay.classList.add('active');
    }

    // Add error handling for terraform commands
    function handleTerraformError(command, error) {
        addTerminalLine(`Error running terraform ${command}:`, 'terminal-error');
        addTerminalLine(error, 'terminal-error');
        
        // Provide helpful hints based on the error
        if (typeof error === 'string') {
            if (error.includes('credentials') || error.includes('access key') || error.includes('secret key')) {
                addTerminalLine('\nHint: Check your AWS credentials and ensure they are correct.', 'terminal-output');
            } else if (error.includes('permission') || error.includes('denied') || error.includes('not authorized')) {
                addTerminalLine('\nHint: Ensure your AWS IAM user has the necessary permissions.', 'terminal-output');
            } else if (error.includes('SSH') || error.includes('key') || error.includes('public_key_path')) {
                addTerminalLine('\nHint: Verify that your SSH public key path is correct and the file exists.', 'terminal-output');
            } else if (error.includes('Cloudflare') || error.includes('cloudflare_api_token') || error.includes('zone_id')) {
                addTerminalLine('\nHint: Check your Cloudflare API token and Zone ID.', 'terminal-output');
            } else if (error.includes('terraform')) {
                addTerminalLine('\nHint: Make sure Terraform is installed correctly on the server.', 'terminal-output');
            } else if (error.includes('file') || error.includes('not found') || error.includes('no such file')) {
                addTerminalLine('\nHint: Check that all required files exist and are accessible.', 'terminal-output');
            }
        }
        
        showAlert('danger', `Error running terraform ${command}. See terminal for details.`);
    }
    
    // Function to check if the backend server is available
    function checkBackendAvailability() {
        fetch('http://localhost:5000/api/check-tfvars')
            .then(response => {
                if (response.ok) {
                    console.log('Backend server is available');
                    return true;
                } else {
                    throw new Error('Backend server returned an error');
                }
            })
            .catch(error => {
                console.error('Backend server is not available:', error);
                showAlert('warning', 'Backend server is not available. Some features may not work properly. Make sure the Flask server is running on port 5000.');
                return false;
            });
    }
    
    // Function to check terraform status
    function checkTerraformStatus() {
        fetch('http://localhost:5000/api/terraform/status')
            .then(response => response.json())
            .then(data => {
                if (data.provisioned) {
                    showInstanceStatusView(data.outputs || {});
                } else {
                    showSetupWizard();
                }
            })
            .catch(error => {
                console.error('Error checking terraform status:', error);
                // If there's an error, show the setup wizard
                showSetupWizard();
            });
    }
    
    // Function to show the instance status view
    function showInstanceStatusView(outputs) {
        // Hide the main setup wizard
        document.querySelector('.container .main-content').style.display = 'none';
        
        // Show the instance status container
        instanceStatusContainer.classList.remove('hidden');
        
        // Populate the instance details
        if (outputs.instance_dns) {
            instanceUrlLink.href = outputs.instance_dns;
            instanceUrlLink.textContent = outputs.instance_dns;
        } else {
            instanceUrlLink.textContent = 'Not available';
            instanceUrlLink.href = '#';
        }
        
        instanceIp.textContent = outputs.instance_public_ip || 'Not available';
        instanceId.textContent = outputs.instance_id || 'Not available';
        sshCommand.textContent = outputs.ssh_connection || 'Not available';
    }
    
    // Function to show the setup wizard
    function showSetupWizard() {
        // Show the main setup wizard
        document.querySelector('.container .main-content').style.display = 'flex';
        
        // Hide the instance status container
        instanceStatusContainer.classList.add('hidden');
    }
    
    // Copy SSH command to clipboard
    copySshBtn.addEventListener('click', function() {
        const sshText = sshCommand.textContent;
        if (sshText && sshText !== 'Not available') {
            navigator.clipboard.writeText(sshText).then(function() {
                // Show temporary success feedback
                const originalIcon = copySshBtn.innerHTML;
                copySshBtn.innerHTML = '<i class="fas fa-check"></i>';
                copySshBtn.style.color = 'var(--success-color)';
                
                setTimeout(function() {
                    copySshBtn.innerHTML = originalIcon;
                    copySshBtn.style.color = '';
                }, 2000);
            }).catch(function(err) {
                console.error('Failed to copy SSH command: ', err);
            });
        }
    });
    
    // Handle destroy instance button
    destroyInstanceBtn.addEventListener('click', function() {
        const warningContent = `
            <p><strong>WARNING: This will permanently destroy your n8n instance and all associated AWS resources!</strong></p>
            <p>This action is IRREVERSIBLE and will result in:</p>
            <ul>
                <li>Complete deletion of your EC2 instance</li>
                <li>Loss of all data stored on the instance</li>
                <li>Removal of security groups and other resources</li>
                <li>Deletion of DNS records (if using Cloudflare)</li>
            </ul>
            <p>Are you absolutely sure you want to proceed?</p>
        `;
        
        showConfirmationModal('DESTROY INSTANCE', warningContent, function() {
            runTerraformDestroy();
        });
    });
    
    // Function to run terraform destroy
    function runTerraformDestroy() {
        destroyInstanceBtn.disabled = true;
        destroyProgressContainer.classList.remove('hidden');
        destroyTerminal.classList.remove('hidden');
        
        // Clear previous terminal output
        destroyTerminal.innerHTML = '';
        
        // Reset progress
        updateDestroyProgress(10, 'Starting destruction process');
        
        // Add initial terminal output
        addTerminalLine('Starting terraform destroy...', 'terminal-command', destroyTerminal);
        
        fetch('http://localhost:5000/api/terraform/destroy', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            const destroyCommandId = data.command_id;
            
            // Poll for command status
            const destroyInterval = setInterval(() => {
                fetch(`http://localhost:5000/api/command/${destroyCommandId}`)
                    .then(response => response.json())
                    .then(statusData => {
                        // Process any new output
                        if (statusData.output) {
                            const lines = statusData.output.split('\n');
                            for (const line of lines) {
                                if (line.trim()) {
                                    const existingLines = destroyTerminal.textContent;
                                    if (!existingLines.includes(line.trim())) {
                                        addTerminalLine(line, 'terminal-output', destroyTerminal);
                                        
                                        // Update progress based on output
                                        if (line.includes('Destroying...')) {
                                            updateDestroyProgress(40, 'Destroying resources');
                                        } else if (line.includes('Destruction complete')) {
                                            updateDestroyProgress(80, 'Resources destroyed');
                                        } else if (line.includes('Destroy complete')) {
                                            updateDestroyProgress(100, 'Destruction complete');
                                        }
                                    }
                                }
                            }
                        }
                        
                        // If command is done, finish the process
                        if (statusData.status === 'done') {
                            clearInterval(destroyInterval);
                            
                            // Check if there was an error
                            if (statusData.output.toLowerCase().includes('error')) {
                                addTerminalLine('Error occurred during destruction. Please check the output above.', 'terminal-error', destroyTerminal);
                                destroyInstanceBtn.disabled = false;
                                return;
                            }
                            
                            updateDestroyProgress(100, 'Destruction complete');
                            addTerminalLine('\nSUCCESS! All AWS resources have been destroyed.', 'terminal-success', destroyTerminal);
                            
                            // Show the back to setup button
                            backToSetupContainer.classList.remove('hidden');
                        }
                    })
                    .catch(error => {
                        clearInterval(destroyInterval);
                        console.error('Error checking destroy command status:', error);
                        addTerminalLine(`Error checking command status: ${error.message}`, 'terminal-error', destroyTerminal);
                        destroyInstanceBtn.disabled = false;
                    });
            }, 1000); // Poll every second
        })
        .catch(error => {
            console.error('Error running terraform destroy:', error);
            addTerminalLine(`Error starting terraform destroy: ${error.message}`, 'terminal-error', destroyTerminal);
            destroyInstanceBtn.disabled = false;
        });
    }
    
    // Function to update destroy progress
    function updateDestroyProgress(percentage, status) {
        destroyProgressFill.style.width = `${percentage}%`;
        destroyProgressStatus.textContent = status;
        destroyProgressPercentage.textContent = `${percentage}%`;
    }
    
    // Handle back to setup button
    backToSetupBtn.addEventListener('click', function() {
        // Hide instance status view and show setup wizard
        showSetupWizard();
        
        // Reset the instance status view
        destroyProgressContainer.classList.add('hidden');
        destroyTerminal.classList.add('hidden');
        backToSetupContainer.classList.add('hidden');
        destroyInstanceBtn.disabled = false;
        destroyTerminal.innerHTML = '';
        updateDestroyProgress(0, 'Initializing...');
    });
    
    // Modified addTerminalLine function to accept terminal parameter
    function addTerminalLine(text, className, terminal = deployTerminal) {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
    }
    
    // Check backend availability when the page loads
    window.addEventListener('load', function() {
        setTimeout(function() {
            checkBackendAvailability();
            // Check terraform status after checking backend availability
            setTimeout(checkTerraformStatus, 500);
        }, 1000); // Check after 1 second to allow page to load
    });
});