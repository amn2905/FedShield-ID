import json
from sqlalchemy.orm import Session
from app.database import GraphNode, GraphEdge

class GraphBuilder:
    """
    Builds and queries the banking identity relation graph.
    Detects collusive risk networks and resource collisions (IPs, Devices) across clients.
    """
    
    @staticmethod
    def get_graph_data(db: Session) -> dict:
        """
        Retrieves all graph nodes and edges from the database.
        """
        nodes = db.query(GraphNode).all()
        edges = db.query(GraphEdge).all()
        
        # Format nodes
        formatted_nodes = []
        for n in nodes:
            formatted_nodes.append({
                "id": n.id,
                "label": n.label,
                "properties": json.loads(n.properties_json) if n.properties_json else {}
            })
            
        # Format edges
        formatted_edges = []
        for e in edges:
            formatted_edges.append({
                "id": e.id,
                "source": e.source,
                "target": e.target,
                "type": e.type
            })
            
        return {
            "nodes": formatted_nodes,
            "edges": formatted_edges
        }

    @staticmethod
    def seed_graph(db: Session):
        """
        Seeds a beautiful, detailed identity trust network containing:
        - Legitimate client connections
        - A collusive account hijacking and resource-pooling network sharing IPs/Devices/Emails/Phones
        - A Synthetic Identity mismatch link
        - Insider relationships (employee accessing suspect customer account)
        """
        # Clear existing graph
        db.query(GraphNode).delete()
        db.query(GraphEdge).delete()
        db.commit()
        
        # 1. Create Nodes
        nodes_data = [
            # Legitimate Cluster
            ("CUST_1", "Customer", {"name": "Amaan Sharma", "risk": "Low", "trust": 92.0}),
            ("DEV_1", "Device", {"model": "iPhone 15 Pro", "reputation": 98.0}),
            ("IP_1", "IP_Address", {"ip": "103.45.12.89", "country": "IN"}),
            ("PAN_1", "PAN_Card", {"number": "APXPS1234F", "holder": "Amaan Sharma"}),
            ("PHONE_1", "Phone", {"number": "+91 98765 43210", "carrier": "Airtel"}),
            ("EMAIL_1", "Email", {"address": "amaan@gmail.com", "domain": "gmail.com"}),
            ("ACC_1", "Account", {"acc_num": "ACT-100982", "balance": 45000.0}),
            
            # Synthetic Identity Node (PAN mismatch)
            ("CUST_2", "Customer", {"name": "Neha Patel", "risk": "High", "trust": 35.0}),
            ("PAN_2", "PAN_Card", {"number": "BPXPS5678G", "holder": "Rajesh Kumar", "alert": "Holder Name Mismatch"}),
            ("PHONE_2", "Phone", {"number": "+91 99999 11111", "carrier": "Jio"}),
            ("EMAIL_2", "Email", {"address": "neha.patel@tempmail.com", "alert": "Disposable Domain"}),
            
            # Collusive Risk Network (Shared resources)
            ("CUST_3", "Customer", {"name": "Vikram Singh", "risk": "Medium", "trust": 55.0}),
            ("CUST_4", "Customer", {"name": "Sanjay Dutt", "risk": "High", "trust": 22.0}),
            ("CUST_5", "Customer", {"name": "Anita Desai", "risk": "High", "trust": 15.0}),
            
            ("DEV_FRAUD", "Device", {"model": "Samsung S20 Rooted", "reputation": 12.0, "alert": "Rooted/Emulated"}),
            ("IP_FRAUD", "IP_Address", {"ip": "185.220.101.4", "vpn": True, "alert": "Tor Exit Node"}),
            
            ("PHONE_FRAUD", "Phone", {"number": "+91 91000 98765", "alert": "VOIP Number"}),
            ("EMAIL_FRAUD", "Email", {"address": "suspect_cluster@yopmail.com", "alert": "Disposable Domain"}),
            
            ("ACC_FRAUD", "Account", {"acc_num": "ACT-888999", "balance": 150.0, "alert": "Suspicious Activity"}),
            ("MERCH_1", "Merchant", {"name": "LegitShop Online"}),
            ("MERCH_FRAUD", "Merchant", {"name": "CryptoTumbler Escrow", "alert": "High Laundering Volume"}),

            # Insider Threat Nodes
            ("EMP_1", "Employee", {"name": "Suresh Kumar", "role": "Teller", "risk": "Low"}),
            ("EMP_INSIDER", "Employee", {"name": "Rajesh Sen", "role": "SysAdmin", "risk": "High", "alert": "Suspicious DB Export"})
        ]
        
        for node_id, label, props in nodes_data:
            node = GraphNode(
                id=node_id,
                label=label,
                properties_json=json.dumps(props)
            )
            db.add(node)
            
        # 2. Create Edges (Relationships)
        edges_data = [
            # Legitimate relations
            ("CUST_1", "DEV_1", "USED_BY"),
            ("CUST_1", "IP_1", "CONNECTED_FROM"),
            ("CUST_1", "PAN_1", "OWNS"),
            ("CUST_1", "PHONE_1", "OWNS"),
            ("CUST_1", "EMAIL_1", "OWNS"),
            ("CUST_1", "ACC_1", "OWNS"),
            ("CUST_1", "MERCH_1", "TRANSACTED_WITH"),
            
            # Synthetic mismatch link
            ("CUST_2", "PAN_2", "OWNS"), # Mismatch exists: Neha Patel owns Rajesh Kumar's PAN
            ("CUST_2", "IP_1", "CONNECTED_FROM"), # Shared IP
            ("CUST_2", "PHONE_2", "OWNS"),
            ("CUST_2", "EMAIL_2", "OWNS"),
            
            # Collusive Risk Network links (Shared IP, Device, Phone, Email)
            ("CUST_3", "DEV_FRAUD", "USED_BY"),
            ("CUST_3", "IP_FRAUD", "CONNECTED_FROM"),
            ("CUST_3", "PHONE_FRAUD", "OWNS"),
            
            ("CUST_4", "DEV_FRAUD", "USED_BY"), # Shared device!
            ("CUST_4", "IP_FRAUD", "CONNECTED_FROM"), # Shared IP!
            ("CUST_4", "PHONE_FRAUD", "OWNS"), # Shared phone number!
            ("CUST_4", "EMAIL_FRAUD", "OWNS"),
            ("CUST_4", "ACC_FRAUD", "OWNS"),
            ("CUST_4", "MERCH_FRAUD", "TRANSACTED_WITH"),
            
            ("CUST_5", "DEV_FRAUD", "USED_BY"), # Shared device!
            ("CUST_5", "IP_FRAUD", "CONNECTED_FROM"), # Shared IP!
            ("CUST_5", "EMAIL_FRAUD", "OWNS"), # Shared email!
            ("CUST_5", "ACC_FRAUD", "OWNS"), # Shared account!
            ("CUST_5", "MERCH_FRAUD", "TRANSACTED_WITH"),

            # Insider threat relationship
            ("EMP_INSIDER", "ACC_FRAUD", "UNAUTHORIZED_ACCESS"), # Sysadmin accessing a flagged fraud customer account!
            ("EMP_1", "ACC_1", "AUTHORIZED_BY") # Normal teller action
        ]
        
        for src, tgt, edge_type in edges_data:
            edge = GraphEdge(
                source=src,
                target=tgt,
                type=edge_type
            )
            db.add(edge)
            
        db.commit()
