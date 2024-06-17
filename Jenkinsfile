pipeline {
    agent any
    environment {
        GIT_CREDENTIALS = credentials('1a6311a6-1c1e-45aa-81e7-e3ead33c4adc')
        // Define environment variable for virtual environment path
        IMAGE_TAG = "${env.BUILD_ID}${GIT_COMMIT[0,7]}"
        REGISTRY_NAME = credentials('digitalocean-registry-name')
        
        CLUSTER_NAME = credentials('digitalocean-cluster-name')
        DOCTL_TOKEN = credentials('doctl-token')
    }
    stages {
        stage('Checkout') {
            steps {
                git branch: 'master', url: 'https://github.com/krishnababuexp/dyneum-verifier-server.git', credentialsId: '1a6311a6-1c1e-45aa-81e7-e3ead33c4adc'
            }
        }
        // stage('Install Dependencies') {
        //     agent {
        //         docker {
        //             image 'node:20-alpine'  // Using a Node.js Docker image
        //         }
        //     }
        //     steps {
        //         // Create a virtual environment
        //         sh 'npm cache clean --force'

        //         sh 'npm install --force'
                
        //         // Activate the virtual environment and Install dependencies
        //         sh '''
        //         npm run build
        //         '''
        //     }
        // }
        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t ${REGISTRY_NAME}/dyn-verifier:${IMAGE_TAG} .
                '''
            }
        }
        stage('Login to DigitalOcean Registry') {
            steps {
                withCredentials([string(credentialsId: 'doctl-token', variable: 'DOCTL_TOKEN')]) {
                    sh '''
                    doctl auth init --access-token ${DOCTL_TOKEN}
                    doctl registry login --expiry-seconds 1200
                    '''
                }
            }
        }
        stage('Push Docker Image') {
            steps {

                sh '''
                docker push ${REGISTRY_NAME}/dyn-verifier:${IMAGE_TAG}
                '''
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([string(credentialsId: 'doctl-token', variable: 'DOCTL_TOKEN')]) {
                    sh '''
                    TAG=${IMAGE_TAG}
                    sed -i 's|<IMAGE>|'${REGISTRY_NAME}'/dyn-verifier:'${TAG}'|' $WORKSPACE/k8s/digitalOcean/deployment.yml
                    
                    doctl kubernetes cluster kubeconfig save --expiry-seconds 600 ${CLUSTER_NAME}
                    
                    kubectl apply -f $WORKSPACE/k8s/digitalOcean/deployment.yml
                    '''
                }
            }
        }
        stage('Check Deployment Status') {
            steps {
                script {
                    try {
                        sh 'kubectl rollout status deployment/dyn-verifier-deployment'
                    } catch (Exception e) {
                        echo "Deployment failed or exceeded the progress deadline. Fetching logs and events for debugging."
                        sh 'kubectl describe deployment dyn-verifier-deployment'
                        sh 'kubectl get pods'
                        sh 'kubectl logs $(kubectl get pods --selector=app=dyn-verifier -o jsonpath="{.items[0].metadata.name}")'
                        error "Deployment exceeded progress deadline"
                    }
                }
            }
        }
        
    }
    post {
        always {
            // Remove Docker images
            sh 'docker rmi ${REGISTRY_NAME}/dyn-verifier:${IMAGE_TAG} || true' 
            sh 'docker system prune -f'
            
            // Clean workspace
            cleanWs()
        }
    }

}